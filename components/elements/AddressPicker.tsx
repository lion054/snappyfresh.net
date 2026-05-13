import { useState, useEffect } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import apiClient from '../../config/api';

const AddressPicker = ({ onAddressSelect }: { onAddressSelect?: (address: any) => void }) => {
    const { selectedAddress: contextAddress, setSelectedAddress: setContextAddress, isLoaded } = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedSuburb, setSelectedSuburb] = useState('');

    // Auto-open modal on first visit if no address selected
    useEffect(() => {
        if (isLoaded && !contextAddress && !showModal) {
            setShowModal(true);
        }
    }, [isLoaded, contextAddress, showModal]);

    const [cities, setCities] = useState<any[]>([]);
    const [suburbs, setSuburbs] = useState<any[]>([]);

    // Load delivery zones when modal opens
    useEffect(() => {
        if (!showModal || countries.length > 0) return;

        const fetchZones = async () => {
            setLoading(true);
            try {
                const response = await (apiClient as any).getDeliveryZones();
                const data: any[] = Array.isArray(response) ? response : (response?.values || response?.data || []);
                if (Array.isArray(data) && data.length > 0) {
                    setCountries(data);
                    const defaultCountry = data[0]['countryCode'];
                    setSelectedCountry(defaultCountry);
                    setCities(data[0].cities || []);
                    if (data[0].cities?.length > 0) {
                        const defaultCity = data[0].cities[0].name;
                        setSelectedCity(defaultCity);
                        setSuburbs(data[0].cities[0].suburbs || []);
                    }
                }
            } catch (err) {
                console.error('Failed to load delivery zones:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchZones();
    }, [showModal, countries.length]);

    // Pre-fill from saved address
    useEffect(() => {
        if (contextAddress && countries.length > 0) {
            const addr = contextAddress.address || {};
            if (addr['countryCode']) setSelectedCountry(addr['countryCode']);
            if (addr.city) setSelectedCity(addr.city);
            if (addr.suburb) setSelectedSuburb(addr.suburb);
        }
    }, [contextAddress, countries]);

    const handleCountryChange = (code: string) => {
        setSelectedCountry(code);
        const country = countries.find(c => c['countryCode'] === code);
        const newCities = country?.cities || [];
        setCities(newCities);
        setSelectedCity(newCities[0]?.name || '');
        setSuburbs(newCities[0]?.suburbs || []);
        setSelectedSuburb('');
    };

    const handleCityChange = (name: string) => {
        setSelectedCity(name);
        const city = cities.find(c => c.name === name);
        const newSuburbs = city?.suburbs || [];
        setSuburbs(newSuburbs);
        setSelectedSuburb('');
    };

    const handleConfirm = () => {
        const country = countries.find(c => c.countryCode === selectedCountry);
        const addressData = {
            display_name: [selectedSuburb, selectedCity, country?.countryName || selectedCountry].filter(Boolean).join(', '),
            address: {
                suburb: selectedSuburb,
                city: selectedCity,
                countryCode: selectedCountry,
                countryName: country?.countryName || selectedCountry,
            }
        };
        setContextAddress(addressData);
        if (onAddressSelect) onAddressSelect(addressData);
        setShowModal(false);
    };

    const getDisplayAddress = () => {
        if (!contextAddress) return null;
        const addr = contextAddress.address || {};
        const suburb = addr.suburb || '';
        const city = addr.city || addr.town || '';
        if (suburb && city) return `${suburb}, ${city}`;
        return city || suburb || contextAddress.display_name?.split(',').slice(0, 2).join(',') || 'Location Set';
    };

    const displayAddr = getDisplayAddress();

    return (
        <>
            <button
                className="sf-location-trigger"
                onClick={() => setShowModal(true)}
                type="button"
            >
                <svg className="sf-location-pin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <div className="sf-location-text">
                    <span className="sf-location-label">Delivering to</span>
                    <span className="sf-location-address">
                        {displayAddr || 'Select address...'}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, opacity: 0.5 }}>
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </div>
            </button>

            {showModal && (
                <>
                    <div className="sf-loc-overlay" onClick={() => setShowModal(false)} />
                    <div className="sf-loc-modal">
                        <div className="sf-loc-modal-header">
                            <h3>Select Delivery Location</h3>
                            <button className="sf-loc-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        {loading ? (
                            <div className="sf-loc-loading">Loading delivery zones...</div>
                        ) : (
                            <div className="sf-loc-form">
                                {/* Country */}
                                <div className="sf-loc-field">
                                    <label>Country</label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                    >
                                        {countries.map(c => (
                                            <option key={c.countryCode} value={c.countryCode}>
                                                {c.countryName || c.countryCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* City */}
                                <div className="sf-loc-field">
                                    <label>City</label>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => handleCityChange(e.target.value)}
                                    >
                                        {cities.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Suburb */}
                                {suburbs.length > 0 && (
                                    <div className="sf-loc-field">
                                        <label>Suburb / Area</label>
                                        <select
                                            value={selectedSuburb}
                                            onChange={(e) => setSelectedSuburb(e.target.value)}
                                        >
                                            <option value="">Select suburb...</option>
                                            {suburbs.map((s, i) => {
                                                const name = typeof s === 'string' ? s : s.name || s.suburb || '';
                                                return <option key={i} value={name}>{name}</option>;
                                            })}
                                        </select>
                                    </div>
                                )}

                                {/* Selected summary */}
                                {(selectedCity || selectedSuburb) && (
                                    <div className="sf-loc-selected">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42af57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                        </svg>
                                        <span>
                                            {[selectedSuburb, selectedCity, selectedCountry].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="sf-loc-confirm-btn"
                            onClick={handleConfirm}
                            disabled={!selectedCity}
                        >
                            Confirm Location
                        </button>
                    </div>
                </>
            )}

            <style jsx>{`
                .sf-location-trigger {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px 14px;
                    border-radius: 10px;
                    transition: background 0.2s;
                    text-align: left;
                    max-width: 260px;
                }
                .sf-location-trigger:hover {
                    background: rgba(255,255,255,0.08);
                }
                .sf-location-pin {
                    color: #42af57;
                    flex-shrink: 0;
                }
                .sf-location-text {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .sf-location-label {
                    font-size: 11px;
                    color: rgba(255,255,255,0.55);
                    font-weight: 500;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .sf-location-address {
                    font-size: 13px;
                    color: #fff;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: flex;
                    align-items: center;
                    line-height: 1.2;
                }

                .sf-loc-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 10000;
                    backdrop-filter: blur(2px);
                }
                .sf-loc-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fff;
                    border-radius: 16px;
                    width: 92%;
                    max-width: 440px;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 10001;
                    padding: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                    animation: sfLocSlideUp 0.25s ease-out;
                }
                @keyframes sfLocSlideUp {
                    from { opacity: 0; transform: translate(-50%, -45%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
                .sf-loc-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .sf-loc-modal-header h3 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1a1a2e;
                    margin: 0;
                }
                .sf-loc-close {
                    background: #f5f5f5;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 22px;
                    color: #595959;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .sf-loc-close:hover {
                    background: #e8e8e8;
                }

                .sf-loc-loading {
                    text-align: center;
                    padding: 40px 0;
                    color: #888;
                    font-size: 14px;
                }

                .sf-loc-form {
                    margin-bottom: 20px;
                }
                .sf-loc-field {
                    margin-bottom: 16px;
                }
                .sf-loc-field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    color: #595959;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }
                .sf-loc-field select {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid #e8e8e8;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #1a1a2e;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.2s;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px center;
                    padding-right: 36px;
                }
                .sf-loc-field select:focus {
                    border-color: #42af57;
                }

                .sf-loc-selected {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: #f0faf0;
                    border-radius: 10px;
                    margin-bottom: 4px;
                    font-size: 13px;
                    color: #333;
                    font-weight: 500;
                }
                .sf-loc-selected svg {
                    flex-shrink: 0;
                }

                .sf-loc-confirm-btn {
                    width: 100%;
                    padding: 14px;
                    background: #42af57;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sf-loc-confirm-btn:hover {
                    background: #369c49;
                }
                .sf-loc-confirm-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .sf-loc-modal {
                        width: 100%;
                        max-width: 100%;
                        max-height: 100vh;
                        border-radius: 16px 16px 0 0;
                        top: auto;
                        bottom: 0;
                        left: 0;
                        transform: none;
                        animation: sfLocSlideUpMobile 0.3s ease-out;
                    }
                    @keyframes sfLocSlideUpMobile {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                }
            `}</style>
        </>
    );
};

export default AddressPicker;
