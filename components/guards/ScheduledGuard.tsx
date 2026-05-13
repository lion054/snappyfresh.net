import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from './AuthGuard';
import Preloader from '../elements/Preloader';

/**
 * Temporary guard override for scheduled pages.
 * AuthGuard still protects unauthenticated users, but instant-only accounts are not redirected away.
 */
function ScheduledAccessCheck({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) return <Preloader />;

  if (loading) return <Preloader />;

  return <>{children}</>;
}

export default function ScheduledGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ScheduledAccessCheck>{children}</ScheduledAccessCheck>
    </AuthGuard>
  );
}
