import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';

interface Address {
    lat?: string | number;
    lon?: string | number;
    display_name?: string;
    address?: {
        road?: string;
        city?: string;
        town?: string;
        suburb?: string;
        village?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface LocationContextType {
    selectedAddress: Address | null;
    setSelectedAddress: (address: Address) => void;
    getShortAddress: () => string;
    clearAddress: () => void;
    isLoaded: boolean;
}

const STORAGE_KEY = 'userAddress';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const suppressPersistRef = useRef(false);

    // Load saved address from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                suppressPersistRef.current = true;
                setSelectedAddressState(parsed);
            } catch (e) {
                console.error('Failed to parse saved address:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Persist on change
    useEffect(() => {
        if (suppressPersistRef.current) {
            suppressPersistRef.current = false;
            return;
        }
        if (selectedAddress) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedAddress));
        }
    }, [selectedAddress]);

    // Cross-tab sync via storage event
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                if (e.newValue === null) {
                    suppressPersistRef.current = true;
                    setSelectedAddressState(null);
                } else {
                    try {
                        suppressPersistRef.current = true;
                        setSelectedAddressState(JSON.parse(e.newValue));
                    } catch { /* ignore */ }
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setSelectedAddress = useCallback((address: Address) => {
        setSelectedAddressState(address);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
    }, []);

    const getShortAddress = useCallback(() => {
        if (!selectedAddress) return 'Select Location';
        const addr = selectedAddress.address || {};
        return addr.city || addr.town || addr.suburb || addr.village || 'Location Set';
    }, [selectedAddress]);

    const clearAddress = useCallback(() => {
        setSelectedAddressState(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const value: LocationContextType = useMemo(() => ({
        selectedAddress,
        setSelectedAddress,
        getShortAddress,
        clearAddress,
        isLoaded
    }), [selectedAddress, setSelectedAddress, getShortAddress, clearAddress, isLoaded]);

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within LocationProvider');
    }
    return context;
};

export default LocationContext;
