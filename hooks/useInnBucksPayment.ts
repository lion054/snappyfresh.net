import { useState, useCallback, useRef } from 'react';
import paymentService from '../services/paymentService';

/**
 * Custom hook for handling InnBucks payment polling
 * Based on Angular cart.component.ts InnBucks payment flow
 */
export const useInnBucksPayment = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [innbucksCode, setInnbucksCode] = useState<string>('');
  const [innbucksQR, setInnbucksQR] = useState<string>('');
  const [pollingAttempt, setPollingAttempt] = useState(0);
  const [pollingError, setPollingError] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start polling for InnBucks payment status
   * Polls every 30 seconds for up to 5 minutes (10 attempts)
   */
  const startInnBucksPolling = useCallback(
    (
      code: string,
      onSuccess: () => void,
      onTimeout: () => void,
      _onError?: (error: Error) => void,
      qrCode?: string,
      reference?: string
    ) => {
      setInnbucksCode(code);
      if (qrCode) setInnbucksQR(qrCode);
      setIsPolling(true);
      setPollingError('');
      setPollingAttempt(0);

      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 30000; // 30 seconds

      const checkStatus = async () => {
        attempts++;
        setPollingAttempt(attempts);

        // Check if max attempts reached
        if (attempts > maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setIsPolling(false);
          setPollingError('Payment confirmation timeout. Please try again.');
          onTimeout();
          return;
        }

        try {
          // Call the InnBucks polling endpoint with code and reference
          const pollingPayload: any = { code };
          if (reference) pollingPayload.reference = reference;

          const response = await paymentService.checkInnBucksTransaction(pollingPayload);

          if (
            response?.success &&
            (response.data?.status === 'Claimed' ||
              response.data?.transactionStatus === 'Claimed')
          ) {
            // Payment successful!
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            setIsPolling(false);
            setPollingError('');
            onSuccess();
          }
        } catch (error) {
          // Continue polling even on error - the payment might still go through
        }
      };

      // First check immediately
      checkStatus();

      // Then check every 30 seconds
      pollingIntervalRef.current = setInterval(checkStatus, pollInterval);
    },
    []
  );

  /**
   * Cancel polling
   */
  const stopInnBucksPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setInnbucksCode('');
    setInnbucksQR('');
    setPollingAttempt(0);
  }, []);

  /**
   * Get formatted time remaining (for UI feedback)
   */
  const getTimeRemaining = useCallback((): string => {
    if (!isPolling) return '';
    const secondsPerAttempt = 30;
    const maxSeconds = 10 * secondsPerAttempt;
    const secondsElapsed = pollingAttempt * secondsPerAttempt;
    const secondsRemaining = Math.max(0, maxSeconds - secondsElapsed);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [isPolling, pollingAttempt]);

  return {
    isPolling,
    innbucksCode,
    innbucksQR,
    pollingAttempt,
    pollingError,
    startInnBucksPolling,
    stopInnBucksPolling,
    getTimeRemaining
  };
};
