import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Preloader from '../elements/Preloader';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, isVisitor, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      // Give a small delay to ensure state has updated
      const timer = setTimeout(() => {
        if (!isAuthenticated || isVisitor) {
          const currentPath = router.asPath;
          // Don't add redirect param if already on login page
          if (!currentPath.includes('/login')) {
            router.push('/login?redirect=' + encodeURIComponent(currentPath));
          }
        } else {
          setIsChecking(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAuthenticated, loading, isVisitor, user, router]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return <Preloader />;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated || isVisitor) {
    return null;
  }

  return <>{children}</>;
}
