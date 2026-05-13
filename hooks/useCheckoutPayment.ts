import { useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../hooks";
import { useInnBucksPayment } from "../hooks/useInnBucksPayment";
import paymentService from "../services/paymentService";
import { toast } from "react-toastify";
import { logger } from "../lib/logger";
import type { FormData } from "./useCheckoutForm";

interface UseCheckoutPaymentOptions {
    formData: FormData;
    separateShipping: boolean;
    deliveryType: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    paymentMethod: string;
    normalizePhone: (value: any) => string;
    normalizePaymentMethod: (method: string) => string;
    validateStep3: () => boolean;
    cartItems: any[];
    setShowInnBucksModal: (open: boolean) => void;
    setShowEcocashModal: (open: boolean) => void;
    ecocashCartIdRef: React.MutableRefObject<any>;
    startInnBucksPolling: ReturnType<typeof useInnBucksPayment>["startInnBucksPolling"];
    stopInnBucksPolling: ReturnType<typeof useInnBucksPayment>["stopInnBucksPolling"];
}

export const useCheckoutPayment = ({
    formData,
    separateShipping,
    deliveryType,
    scheduledDate,
    scheduledTimeSlot,
    paymentMethod,
    normalizePhone,
    normalizePaymentMethod,
    validateStep3,
    cartItems,
    setShowInnBucksModal,
    setShowEcocashModal,
    ecocashCartIdRef,
    startInnBucksPolling,
    stopInnBucksPolling,
}: UseCheckoutPaymentOptions) => {
    const router = useRouter();
    const { clearCart } = useCart();

    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [cartPreview, setCartPreview] = useState<any>(null);
    const [previewError, setPreviewError] = useState(false);

    const withTimeout = (promise: Promise<any>, ms: number): Promise<any> => {
        let id: ReturnType<typeof setTimeout>;
        const tp = new Promise((_, rej) => {
            id = setTimeout(() => rej(new Error("Request timed out")), ms);
        });
        return Promise.race([promise, tp]).finally(() => clearTimeout(id));
    };

    const previewOrder = async (): Promise<boolean> => {
        if (!validateStep3()) return false;
        setIsPreviewLoading(true);
        setPreviewError(false);
        try {
            // Build billing/shipping data and order payload (oldyomik-compatible)
            const billingPhone = normalizePhone(formData.paymentPhoneNumber || formData.mobileNumber);
            const billingStreet = `${formData.billAddressLine1}, ${formData.billCity}, ${formData.billSuburb}, ${formData.billCountryName || "Zimbabwe"}`;
            const shippingStreet = separateShipping
                ? `${formData.shipAddressLine1}, ${formData.shipCity}, ${formData.shipSuburb}, ${formData.shipCountryName || "Zimbabwe"}`
                : billingStreet;

            const orderPayload = paymentService.buildOrderPayload({
                ...formData,
                billingAddress: billingStreet,
                billingCity: formData.billCity,
                billingSuburb: formData.billSuburb,
                billingCountry: formData.billCountryName || formData.billCountry || "Zimbabwe",
                shippingAddress: shippingStreet,
                shippingCity: separateShipping ? formData.shipCity : formData.billCity,
                shippingSuburb: separateShipping ? formData.shipSuburb : formData.billSuburb,
                shippingCountry: separateShipping ? (formData.shipCountryName || formData.shipCountry) : (formData.billCountryName || formData.billCountry),
                useShippingAddress: separateShipping,
                deliveryType,
                scheduledDate,
                scheduledTimeSlot,
                paymentMethod: normalizePaymentMethod(paymentMethod),
                paymentPhoneNumber: billingPhone,
                paymentFullName: `${formData.firstName} ${formData.lastName}`,
                returnUrl: typeof window !== "undefined" ? `${window.location.origin}/check-order` : ""
            }, cartItems);

            logger.debug('[Checkout] Previewing cart with payload:', orderPayload);

            const previewResult = await paymentService.previewCart(orderPayload);
            if (!previewResult?.success || !previewResult?.data) {
                throw new Error(previewResult?.error || "Failed to preview order");
            }

            logger.debug('[Checkout] Preview cart response:', previewResult.data);

            setCartPreview(previewResult.data);
            setIsPreview(true);
            setIsPreviewLoading(false);
            return true;
        } catch (error: any) {
            const msg = error?.message || "Failed to preview order";
            logger.error("Create order preview failed:", msg, error);
            toast.error(msg, { autoClose: 8000 });
            setIsPreviewLoading(false);
            setPreviewError(true);
            return false;
        }
    };

    const handleSubmit = async (setLoading: (loading: boolean) => void): Promise<void> => {
        if (!validateStep3()) return;
        if (!cartPreview) { toast.error("Order not created. Please review and try again."); return; }
        setLoading(true);
        try {
            const preview = cartPreview as any;
            const cartId = preview?.cartId || preview?.CartId || preview?.cart?.id || preview?.docEntry || preview?.DocEntry || preview?.id;
            const paymentRef = preview?.paymentReference || preview?.PaymentReference || '';

            if (!cartId) {
                throw new Error("Unable to confirm order. Cart preview is missing cartId.");
            }

            const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

            logger.debug('[Checkout] handleSubmit starting', { cartId, paymentMethod: normalizedPaymentMethod });

            // Ecocash: Show modal for user to complete payment
            if (paymentMethod === "Ecocash") {
                setLoading(false);
                setShowEcocashModal(true);
                ecocashCartIdRef.current = cartId;
                return;
            }

            // PayNow: Get payment code and redirect to PayNow portal
            if (paymentMethod === "PayNow") {
                logger.debug('[Checkout] Initiating PayNow payment', { cartId });
                const result = await withTimeout(paymentService.createOrderFromCartPayNow({ cartId }), 30000);

                if (result?.success && result.data?.redirectLink) {
                    logger.debug('[Checkout] PayNow redirect link received', { link: result.data.redirectLink });
                    // Store order info before clearing
                    localStorage.setItem("activeOrder", JSON.stringify({
                        cartId,
                        paymentReference: paymentRef,
                        paymentMethod: normalizedPaymentMethod,
                        total: preview?.docTotal || preview?.DocTotal || 0
                    }));
                    clearCart();
                    // Open in new tab
                    window.open(result.data.redirectLink, "_blank");
                    // Show success and redirect
                    toast.success("Redirecting to PayNow portal...");
                    setTimeout(() => router.push("/check-order?success=true"), 2000);
                    return;
                }
                throw new Error(result?.error || "Failed to initiate PayNow payment");
            }

            // InnBucks: Get payment code and show QR code modal, then poll for payment
            if (paymentMethod === "InnBucks") {
                logger.debug('[Checkout] Initiating InnBucks payment', { cartId });
                const result = await withTimeout(paymentService.createOrderFromCartInnBucks({ cartId }), 30000);

                if (result?.success && (result.data?.code || result.data?.paymentCode)) {
                    const code = result.data.code || result.data.paymentCode;
                    const reference = result.data.reference || result.data.paymentReference || paymentRef || '';
                    const qrCode = result.data.qrCode || result.data.QRCode || result.data.qrcode || '';

                    logger.debug('[Checkout] InnBucks code received', { code, reference });

                    setLoading(false);
                    setShowInnBucksModal(true);

                    // Start polling for payment confirmation
                    startInnBucksPolling(
                        code,
                        async () => {
                            // Payment confirmed - create the order
                            try {
                                logger.debug('[Checkout] InnBucks payment confirmed, creating order');
                                const orderResult = await paymentService.createOrderFromCart({
                                    cartId,
                                    paymentMethod: normalizedPaymentMethod
                                });

                                if (orderResult?.success) {
                                    toast.success("Payment confirmed! Order created successfully!");
                                    clearCart();
                                    stopInnBucksPolling();
                                    setShowInnBucksModal(false);
                                    router.push("/check-order?success=true");
                                } else {
                                    throw new Error(orderResult?.error || "Failed to create order after payment");
                                }
                            } catch (error) {
                                const msg = error instanceof Error ? error.message : "Order creation failed";
                                toast.error(msg);
                                logger.error('[Checkout] Order creation failed after InnBucks payment', error);
                            }
                        },
                        () => {
                            toast.error("Payment confirmation timed out. Please verify on your phone.");
                            setShowInnBucksModal(false);
                        },
                        (error) => {
                            logger.error("InnBucks polling error:", error);
                        },
                        qrCode,
                        reference // Pass reference for polling
                    );
                    return;
                }
                throw new Error(result?.error || "Failed to get InnBucks payment code");
            }

            // Cash on Delivery / Pay on Account: Create order directly
            if (paymentMethod === "CashOnDelivery" || paymentMethod === "Account") {
                logger.debug('[Checkout] Creating order for', { paymentMethod: normalizedPaymentMethod });
                const orderResult = await paymentService.createOrderFromCart({
                    cartId,
                    paymentMethod: normalizedPaymentMethod
                });

                if (orderResult?.success) {
                    toast.success("Order placed successfully!");
                    clearCart();
                    router.push("/check-order?success=true");
                    return;
                }
                throw new Error(orderResult?.error || "Failed to place order");
            }

            // Fallback for any other payment method
            logger.warn('[Checkout] Unknown payment method, treating as direct order', { paymentMethod });
            const orderResult = await paymentService.createOrderFromCart({
                cartId,
                paymentMethod: normalizedPaymentMethod
            });

            if (orderResult?.success) {
                toast.success("Order placed successfully!");
                clearCart();
                router.push("/check-order?success=true");
                return;
            }
            throw new Error(orderResult?.error || "Failed to place order");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Checkout failed";
            logger.error("[Checkout] Payment submission failed:", errorMessage, error);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const cancelOrder = () => {
        setIsPreview(false);
        setPreviewError(false);
    };

    return {
        previewOrder,
        handleSubmit,
        cartPreview,
        isPreview,
        setIsPreview,
        isPreviewLoading,
        previewError,
        setPreviewError,
        cancelOrder,
    };
};
