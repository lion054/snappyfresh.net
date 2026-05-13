/**
 * Live password requirements checklist.
 * Shows which requirements are met/unmet as the user types.
 */
export default function PasswordChecklist({ password = '' }) {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="password-checklist" aria-label="Password requirements">
      {checks.map((check) => (
        <li key={check.label} className={check.met ? 'met' : 'unmet'}>
          <span className="check-icon">{check.met ? '\u2713' : '\u2022'}</span>
          {check.label}
        </li>
      ))}
    </ul>
  );
}
