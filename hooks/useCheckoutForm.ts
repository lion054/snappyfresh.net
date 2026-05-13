import { useState, useEffect } from "react";
import { useAuth } from "../hooks";
import apiClient from "../config/api";
import { toast } from "react-toastify";

export interface FormData {
    firstName: string;
    lastName: string;
    secondName: string;
    companyName: string;
    email: string;
    mobileNumber: string;
    billAddressLine1: string;
    billAddressLine2: string;
    billCity: string;
    billSuburb: string;
    billCountry: string;
    billCountryCode: string;
    billCountryName: string;
    shipAddressLine1: string;
    shipAddressLine2: string;
    shipCity: string;
    shipSuburb: string;
    shipCountry: string;
    shipCountryCode: string;
    shipCountryName: string;
    paymentPhoneNumber: string;
}

interface UseCheckoutFormOptions {
    deliveryType: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    paymentMethod: string;
}

export const useCheckoutForm = ({
    deliveryType,
    scheduledDate,
    scheduledTimeSlot,
    paymentMethod,
}: UseCheckoutFormOptions) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        firstName: "", lastName: "", secondName: "", companyName: "",
        email: "", mobileNumber: "",
        billAddressLine1: "", billAddressLine2: "", billCity: "", billSuburb: "",
        billCountry: "", billCountryCode: "", billCountryName: "",
        shipAddressLine1: "", shipAddressLine2: "", shipCity: "", shipSuburb: "",
        shipCountry: "", shipCountryCode: "", shipCountryName: "",
        paymentPhoneNumber: ""
    });

    const [countries, setCountries] = useState<any[]>([]);
    const [billCities, setBillCities] = useState<any[]>([]);
    const [billSuburbs, setBillSuburbs] = useState<any[]>([]);
    const [shipCities, setShipCities] = useState<any[]>([]);
    const [shipSuburbs, setShipSuburbs] = useState<any[]>([]);
    const [separateShipping, setSeparateShipping] = useState(false);
    const [zonesError, setZonesError] = useState<string | null>(null);

    // Load delivery zones
    useEffect(() => {
        const loadZones = async () => {
            try {
                setZonesError(null);
                const zones = await (apiClient as any).getDeliveryZones();
                setCountries(zones);
                if (zones.length > 0) {
                    const dc = zones[0];
                    const dCity = dc.cities?.[0]?.name || "";
                    const dSuburb = dc.cities?.[0]?.suburbs?.[0]?.name || "";
                    setBillCities(dc.cities || []); setBillSuburbs(dc.cities?.[0]?.suburbs || []);
                    setShipCities(dc.cities || []); setShipSuburbs(dc.cities?.[0]?.suburbs || []);
                    setFormData((prev) => ({ ...prev, billCountry: dc.countryCode, billCountryCode: dc.countryCode, billCountryName: dc.countryName || dc.countryCode, billCity: dCity, billSuburb: dSuburb, shipCountry: dc.countryCode, shipCountryCode: dc.countryCode, shipCountryName: dc.countryName || dc.countryCode, shipCity: dCity, shipSuburb: dSuburb }));
                }
            } catch (error) {
                setZonesError('Failed to load delivery zones. Please refresh the page and try again.');
            }
        };
        loadZones();
    }, []);

    // Pre-fill from user session
    useEffect(() => {
        if (!user || user.customer?.isVisitor) return;
        const c = user.customer;
        const address = (c?.addresses?.[0] || {}) as any;
        const nameParts = (c?.cardName || '').split(' ');
        const userCountry = address.country || '';
        const userCity = address.city || '';

        // Try multiple phone field variations
        const userPhone = c?.phone1 || (c as any)?.phone || (c as any)?.mobileNumber || (c as any)?.mobilePhone || (c as any)?.phoneNumber || '';

        setFormData((prev) => ({
            ...prev,
            firstName: nameParts[0] || prev.firstName,
            lastName: nameParts.slice(1).join(' ') || prev.lastName,
            companyName: c?.cardName || prev.companyName,
            email: c?.emailAddress || prev.email,
            mobileNumber: userPhone || prev.mobileNumber,
            paymentPhoneNumber: userPhone || prev.paymentPhoneNumber,
            billAddressLine1: address.street || prev.billAddressLine1,
            billCity: userCity || prev.billCity,
            billCountry: userCountry || prev.billCountry,
        }));

        // Load suburbs for pre-filled city
        if (userCountry && userCity) {
            const country = countries.find((x: any) => x.countryCode === userCountry);
            const city = country?.cities?.find((x: any) => x.name === userCity);
            if (city?.suburbs) {
                setBillSuburbs(city.suburbs);
            }
        }

        // Also try fetching full BP details for additional fields
        const cardCode = c?.cardCode;
        if (!cardCode) return;
        const loadFullProfile = async () => {
            try {
                const bp = await (apiClient as any).getBusinessPartnerDetails(cardCode);
                const bpAddr = bp.bpAddresses?.[0] || bp.addresses?.[0] || bp.Addresses?.[0] || {};
                const bpCountry = bpAddr.country || bpAddr.Country || bp.country || bp.Country || userCountry;
                const bpCity = bpAddr.city || bpAddr.City || bp.city || bp.City || userCity;
                const bpSuburb = bpAddr.suburb || bpAddr.Suburb || bpAddr.suburb || '';

                // Try multiple phone field variations from BP details
                const bpPhone = bp.phone1 || bp.Phone1 || bp.phone || bp.Phone ||
                               bp.mobileNumber || bp.MobileNumber ||
                               bp.mobilePhone || bp.MobilePhone ||
                               bp.phoneNumber || bp.PhoneNumber ||
                               (bp as any).cellPhone || (bp as any).CellPhone ||
                               userPhone;

                setFormData((prev) => ({
                    ...prev,
                    firstName: bp.firstName || bp.FirstName || prev.firstName,
                    lastName: bp.lastName || bp.LastName || prev.lastName,
                    companyName: bp.cardName || bp.CardName || prev.companyName,
                    email: bp.emailAddress || bp.EmailAddress || prev.email,
                    mobileNumber: bpPhone || prev.mobileNumber,
                    paymentPhoneNumber: bpPhone || prev.paymentPhoneNumber,
                    billAddressLine1: bpAddr.block || bpAddr.Block || bpAddr.street || bpAddr.Street || prev.billAddressLine1,
                    billCity: bpCity || prev.billCity,
                    billCountry: bpCountry || prev.billCountry,
                    billSuburb: bpSuburb || prev.billSuburb,
                }));

                // Load suburbs for BP city
                if (bpCountry && bpCity) {
                    const country = countries.find((x: any) => x.countryCode === bpCountry);
                    const city = country?.cities?.find((x: any) => x.name === bpCity);
                    if (city?.suburbs) {
                        setBillSuburbs(city.suburbs);
                    }
                }
            } catch { /* silently fail — session data already pre-filled */ }
        };
        loadFullProfile();
    }, [user?.customer?.cardCode, countries]);

    // Sync mobile to payment phone if not set
    useEffect(() => {
        if (formData.mobileNumber && !formData.paymentPhoneNumber) setFormData((prev) => ({ ...prev, paymentPhoneNumber: prev.mobileNumber }));
    }, [formData.mobileNumber]);

    const normalizePhone = (value: any): string => {
        if (!value) return "";
        const t = value.toString().trim().replace(/\s+/g, "");
        if (t.startsWith("+")) return t;
        if (t.startsWith("0")) return `+263${t.slice(1)}`;
        if (/^\d+$/.test(t)) return `+263${t}`;
        return t;
    };

    const handleChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const updateBillCities = (cc: string) => {
        const c = countries.find((x: any) => x.countryCode === cc);
        const nc = c ? c.cities : [];
        setBillCities(nc); setBillSuburbs([]);
        setFormData((prev) => ({ ...prev, billCountry: cc, billCountryCode: cc, billCountryName: c?.countryName || cc, billCity: "", billSuburb: "" }));
    };

    const updateBillSuburbs = (cn: string) => {
        const c = countries.find((x: any) => x.countryCode === formData.billCountry);
        const city = c?.cities?.find((x: any) => x.name === cn);
        setBillSuburbs(city?.suburbs || []);
        setFormData((prev) => ({ ...prev, billCity: cn, billSuburb: "" }));
    };

    const updateShipCities = (cc: string) => {
        const c = countries.find((x: any) => x.countryCode === cc);
        const nc = c ? c.cities : [];
        setShipCities(nc); setShipSuburbs([]);
        setFormData((prev) => ({ ...prev, shipCountry: cc, shipCountryCode: cc, shipCountryName: c?.countryName || cc, shipCity: "", shipSuburb: "" }));
    };

    const updateShipSuburbs = (cn: string) => {
        const c = countries.find((x: any) => x.countryCode === formData.shipCountry);
        const city = c?.cities?.find((x: any) => x.name === cn);
        setShipSuburbs(city?.suburbs || []);
        setFormData((prev) => ({ ...prev, shipCity: cn, shipSuburb: "" }));
    };

    const onSeparateShippingChange = (checked: boolean) => {
        setSeparateShipping(checked);
        if (!checked) setFormData((prev) => ({ ...prev, shipAddressLine1: "", shipAddressLine2: "", shipCity: "", shipSuburb: "", shipCountry: prev.billCountry, shipCountryCode: prev.billCountryCode, shipCountryName: prev.billCountryName }));
    };

    const validateStep1 = (): boolean => {
        if (!formData.firstName.trim()) { toast.error("First name is required"); return false; }
        if (!formData.lastName.trim()) { toast.error("Last name is required"); return false; }
        if (!formData.email.trim()) { toast.error("Email is required"); return false; }
        if (!formData.mobileNumber.trim()) { toast.error("Mobile number is required"); return false; }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (!formData.billCountry) { toast.error("Country is required"); return false; }
        if (!formData.billCity) { toast.error("City is required"); return false; }
        if (!formData.billSuburb) { toast.error("Suburb is required"); return false; }
        if (!formData.billAddressLine1.trim()) { toast.error("Address is required"); return false; }
        if (deliveryType === "scheduled") {
            if (!scheduledDate) { toast.error("Please select a delivery date"); return false; }
            if (!scheduledTimeSlot) { toast.error("Please select a time slot"); return false; }
        }
        return true;
    };

    const validateStep3 = (): boolean => {
        if (!paymentMethod) { toast.error("Please select a payment method"); return false; }
        if ((paymentMethod === "Ecocash" || paymentMethod === "InnBucks") && !formData.paymentPhoneNumber.trim()) { toast.error("Payment phone number is required"); return false; }
        return true;
    };

    return {
        formData,
        separateShipping,
        countries,
        billCities,
        billSuburbs,
        shipCities,
        shipSuburbs,
        updateBillCities,
        updateBillSuburbs,
        updateShipCities,
        updateShipSuburbs,
        onSeparateShippingChange,
        handleChange,
        normalizePhone,
        validateStep1,
        validateStep2,
        validateStep3,
        zonesError,
    };
};
