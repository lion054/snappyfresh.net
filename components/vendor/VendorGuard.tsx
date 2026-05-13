import { useEffect, useState, ReactNode } from 'react';
import { useVendorAuth } from './VendorAuthContext';
import { useRouter } from 'next/router';

export default function VendorGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useVendorAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const currentPath = router.asPath;
        router.push('/vendor/login?redirect=' + encodeURIComponent(currentPath));
      } else {
        setReady(true);
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f7f8fa', fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #1a5c38, #27ae60)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 auto 16px',
          }}>SF</div>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
