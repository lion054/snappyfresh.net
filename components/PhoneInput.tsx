import { useState, useEffect, useId, FC } from 'react';

/**
 * Reusable Phone Input Component with Country Selector
 * Automatically formats phone numbers with country code
 * Pre-selected to Zimbabwe (+263)
 */
interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const PhoneInput: FC<PhoneInputProps> = ({
  value = '',
  onChange,
  label = 'Phone Number',
  required = false,
  placeholder = 'Enter phone number',
  disabled = false
}) => {
  const id = useId();

  // Country code mapping
  const countries = {
    ZW: { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
    ZA: { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    BW: { code: '+267', name: 'Botswana', flag: '🇧🇼' },
    MZ: { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
    MW: { code: '+265', name: 'Malawi', flag: '🇲🇼' },
    ZM: { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  } as const;

  type CountryCode = keyof typeof countries;
  const [country, setCountry] = useState<CountryCode>('ZW');
  const [localNumber, setLocalNumber] = useState('');

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      // Check if value starts with country code
      for (const [key, data] of Object.entries(countries)) {
        if (value.startsWith(data.code)) {
          setCountry(key as CountryCode);
          setLocalNumber(value.replace(data.code, '').replace(/^\s+/, ''));
          return;
        }
      }
      // If no country code, assume it's just the local number
      setLocalNumber(value);
    }
  }, []);

  // Update parent component with formatted number
  useEffect(() => {
    if (localNumber) {
      const formattedNumber = `${countries[country].code}${localNumber}`;
      onChange(formattedNumber);
    } else {
      onChange('');
    }
  }, [localNumber, country]);

  // Handle local number input - allow only digits
  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setLocalNumber(input);
  };

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value as CountryCode);
  };

  return (
    <div className="phone-input-wrapper">
      {label && (
        <label className="phone-input-label" htmlFor={`${id}-number`}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="phone-input-container">
        {/* Country Selector */}
        <select
          id={`${id}-country`}
          value={country}
          onChange={handleCountryChange}
          disabled={disabled}
          className="phone-country-select"
          aria-label="Country code"
        >
          {Object.entries(countries).map(([code, data]) => (
            <option key={code} value={code}>
              {data.flag} {data.code}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <input
          id={`${id}-number`}
          type="tel"
          value={localNumber}
          onChange={handleLocalNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className="phone-number-input"
          maxLength={15}
          aria-label="Phone number"
        />
      </div>

      {/* Display formatted number */}
      {localNumber && (
        <div className="phone-input-formatted">
          {countries[country].code}{localNumber}
        </div>
      )}

      <style jsx>{`
        .phone-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .phone-input-label {
          font-weight: 600;
          color: #253d4e;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .required {
          color: #e74c3c;
          margin-left: 4px;
          font-weight: bold;
        }

        .phone-input-container {
          display: flex;
          gap: 10px;
          width: 100%;
          align-items: center;
        }

        .phone-country-select {
          padding: 12px 12px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 15px;
          background-color: #fff;
          cursor: pointer;
          min-width: 90px;
          width: 90px;
          height: 48px;
          flex-shrink: 0;
          font-weight: 600;
          color: #253d4e;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone-country-select:hover {
          border-color: #42af57;
          box-shadow: 0 2px 8px rgba(66, 175, 87, 0.1);
        }

        .phone-country-select:focus {
          outline: none;
          border-color: #42af57;
          box-shadow: 0 0 0 4px rgba(66, 175, 87, 0.12), 0 2px 8px rgba(66, 175, 87, 0.15);
          background-color: #fafbfa;
        }

        .phone-country-select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.6;
          border-color: #ddd;
        }

        .phone-number-input {
          flex: 1;
          padding: 12px 14px;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 500;
          color: #253d4e;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          background-color: #fff;
          height: 48px;
          box-sizing: border-box;
        }

        .phone-number-input::placeholder {
          color: #a0a0a0;
          font-weight: 400;
        }

        .phone-number-input:hover {
          border-color: #42af57;
          box-shadow: 0 2px 8px rgba(66, 175, 87, 0.1);
        }

        .phone-number-input:focus {
          outline: none;
          border-color: #42af57;
          box-shadow: 0 0 0 4px rgba(66, 175, 87, 0.12), 0 2px 8px rgba(66, 175, 87, 0.15);
          background-color: #fafbfa;
        }

        .phone-number-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.6;
          border-color: #ddd;
        }

        .phone-input-formatted {
          font-size: 13px;
          color: #42af57;
          padding: 8px 12px;
          background: linear-gradient(135deg, rgba(66, 175, 87, 0.08) 0%, rgba(66, 175, 87, 0.04) 100%);
          border-radius: 6px;
          border-left: 4px solid #42af57;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-weight: 600;
          letter-spacing: 0;
          margin-top: 4px;
          animation: slideIn 0.3s ease-out;
          word-break: break-all;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .phone-input-wrapper {
            gap: 6px;
          }

          .phone-input-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #4a664a;
            letter-spacing: 0.025em;
          }

          .phone-input-container {
            gap: 8px;
          }

          .phone-country-select {
            min-width: 90px;
            width: 90px;
            height: 48px;
            font-size: 14px;
            padding: 10px 8px;
            border-radius: 10px;
          }

          .phone-number-input {
            height: 48px;
            font-size: 16px !important;
            border-radius: 10px;
            padding: 12px 14px;
          }

          .phone-input-formatted {
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default PhoneInput;
