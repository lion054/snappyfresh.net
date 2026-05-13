import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { loginSchema } from '../../lib/validation';
import { useFormValidation } from '../../hooks/useFormValidation';
import InlineFieldError from '../common/InlineFieldError';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  pendingRedirect?: string;
  hideBanner?: boolean;
}

export default function LoginForm({ onSuccess, onSwitchToRegister, pendingRedirect, hideBanner = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { fieldErrors, validateField, validateAll, clearFieldError } = useFormValidation(loginSchema);

  useEffect(() => {
    if (loginSuccess && isAuthenticated && user && !user.customer?.isVisitor) {
      if (pendingRedirect) {
        router.push(pendingRedirect);
      }
      onSuccess?.();
    }
  }, [loginSuccess, isAuthenticated, user, router, pendingRedirect, onSuccess]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validation = validateAll({ email, password });
    if (!validation.success) return;
    setLoading(true);
    setLoginSuccess(false);
    setLoginError('');
    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      setLoginSuccess(true);
    } else {
      setLoginError(result.error || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner - hidden on mobile AuthModal (uses header banner instead) */}
      {!hideBanner && (
        <div className="am-banner">
          <div className="am-banner-bg" />
          <div className="am-emojis">🥑 🧀 🍓 🛒 🥦 🍊 🔧 🍫 🥚</div>
          <div className="am-logo">Snappy<span>Fresh</span></div>
        </div>
      )}

      {/* Body */}
      <div className="am-body">
        <div className="am-title">Welcome Back!</div>
        <div className="am-sub">Sign in to access your orders, saved addresses &amp; exclusive offers.</div>

        <form onSubmit={handleSubmit} noValidate>
          {loginError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b',
              display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5,
            }}>
              <span style={{ flexShrink: 0 }}>&#x26A0;</span>
              <span>{loginError}</span>
            </div>
          )}
          <label htmlFor="login-email" className="visually-hidden">Email address</label>
          <div className={`am-input-wrap ${fieldErrors.email ? 'am-error' : ''}`}>
            <div className="am-input-prefix">✉️</div>
            <input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); setLoginError(''); }}
              onBlur={() => validateField('email', email)}
              inputMode="email"
              autoComplete="email"
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
            />
          </div>
          <div className="am-field-error" id="login-email-error"><InlineFieldError error={fieldErrors.email} /></div>

          <label htmlFor="login-password" className="visually-hidden">Password</label>
          <div className={`am-input-wrap ${fieldErrors.password ? 'am-error' : ''}`}>
            <div className="am-input-prefix">🔒</div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setLoginError(''); }}
              onBlur={() => validateField('password', password)}
              autoComplete="current-password"
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              aria-invalid={fieldErrors.password ? 'true' : undefined}
            />
            <button type="button" className="am-pwd-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="am-field-error" id="login-password-error"><InlineFieldError error={fieldErrors.password} /></div>

          <Link href="/forgot-password" className="am-forgot">Forgot your password?</Link>

          <button type="submit" className="am-go-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <div className="am-divider">
            <div className="am-div-line" />
            <div className="am-div-txt">OR CONTINUE WITH</div>
            <div className="am-div-line" />
          </div>

          <div className="am-signup">
            Don&apos;t have an account?{' '}
            {onSwitchToRegister ? (
              <button type="button" onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#1a5c38', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
                Sign up here
              </button>
            ) : (
              <Link href="/register">Sign up here</Link>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
