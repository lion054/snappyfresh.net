import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../config/api';
import { normalizeArray } from '../lib/normalizeApiResponse';
import { logger } from '../lib/logger';

/**
 * Hook to check if current user has access to scheduled orders feature
 * Checks via API call to backend - tries to fetch available schedules
 */
export const useScheduledOrdersAccess = () => {
    const { user, isAuthenticated } = useAuth();
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [isApprovedStatus, setIsApprovedStatus] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);
    const lastCheckedCardCode = useRef<string | null>(null);
    const checkInProgressRef = useRef(false);

    /**
     * Perform the actual access check against the API
     */
    const performAccessCheck = async () => {
        // Visitors never have access
        if (!isAuthenticated || user?.customer?.isVisitor) {
            if (mountedRef.current) {
                setIsApprovedStatus(false);
                setIsChecking(false);
                setError(null);
            }
            return;
        }

        // Skip if already checked for this card code or check is in progress
        const cardCode = user?.customer?.cardCode || '';
        if (checkInProgressRef.current) return;
        if (lastCheckedCardCode.current === cardCode && isApprovedStatus !== null) {
            setIsChecking(false);
            return;
        }

        try {
            checkInProgressRef.current = true;
            if (mountedRef.current) {
                setIsChecking(true);
                setError(null);
            }

            // Create abort controller for this request
            abortControllerRef.current = new AbortController();

            // Try to fetch available schedules to check if user has access
            const response = await (apiClient as any).getStoreOrderSchedules();

            // Only update state if component is still mounted
            if (!mountedRef.current) return;

            // Use same logic as scheduled-new-order.tsx:
            // normalizeArray → filter open schedules → any results = approved
            const schedules = normalizeArray(response);
            const openSchedules = schedules.filter((s: any) =>
                (s.Status ?? s.status ?? 'Open') === 'Open'
            );

            if (openSchedules.length > 0) {
                logger.debug('[ScheduledOrdersAccess] User has open scheduled deliveries', { count: openSchedules.length });
                setIsApprovedStatus(true);
                setError(null);
            } else {
                logger.debug('[ScheduledOrdersAccess] No open scheduled deliveries found');
                setIsApprovedStatus(false);
                setError(null);
            }
        } catch (error: any) {
            // Don't update state if component unmounted
            if (!mountedRef.current) return;

            // Check error status code
            const status = error?.status || error?.statusCode;

            if (status === 403 || status === 401) {
                // 403 Forbidden = not approved, 401 = session expired
                logger.debug('[ScheduledOrdersAccess] User not approved:', { status, message: error?.message });
                setIsApprovedStatus(false);
                setError(null);
            } else if (status === 404) {
                // Endpoint doesn't exist - assume not available
                logger.warn('[ScheduledOrdersAccess] Scheduled orders endpoint not found');
                setIsApprovedStatus(false);
                setError(null);
            } else {
                // Other error - log it but default to not approved
                logger.warn('[ScheduledOrdersAccess] Error checking access:', error?.message);
                setIsApprovedStatus(false);
                setError(error?.message || 'Failed to check access');
            }
        } finally {
            checkInProgressRef.current = false;
            lastCheckedCardCode.current = cardCode;
            if (mountedRef.current) {
                setIsChecking(false);
            }
        }
    };

    /**
     * Check backend for access to scheduled orders on component mount
     */
    useEffect(() => {
        mountedRef.current = true;
        performAccessCheck();

        // Cleanup on unmount
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [isAuthenticated, user?.customer?.cardCode, user?.customer?.isVisitor]);

    /**
     * Handle navigation to scheduled orders
     * If user is not approved, show modal instead of navigating
     */
    const handleAccessScheduledOrders = (onAccessGranted?: () => void): boolean => {
        if (isApprovedStatus === true) {
            onAccessGranted?.();
            return true;
        }

        setShowAccessModal(true);
        return false;
    };

    /**
     * Close the access modal
     */
    const closeAccessModal = () => {
        setShowAccessModal(false);
    };

    /**
     * Retry access check
     */
    const retryAccessCheck = () => {
        lastCheckedCardCode.current = null;
        performAccessCheck();
    };

    return {
        isApproved: isApprovedStatus === true,
        isChecking,
        error,
        showAccessModal,
        setShowAccessModal,
        handleAccessScheduledOrders,
        closeAccessModal,
        retryAccessCheck,
        isAuthenticated,
        user
    };
};

export default useScheduledOrdersAccess;
