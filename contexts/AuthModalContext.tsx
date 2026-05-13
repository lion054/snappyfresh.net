import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

interface AuthModalState {
  isOpen: boolean;
  view: 'login' | 'register';
  pendingRedirect?: string;
  openAuthModal: (view?: 'login' | 'register', redirect?: string) => void;
  closeAuthModal: () => void;
  switchView: (view: 'login' | 'register') => void;
}

const AuthModalContext = createContext<AuthModalState | null>(null);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [pendingRedirect, setPendingRedirect] = useState<string | undefined>();

  const openAuthModal = useCallback((v: 'login' | 'register' = 'login', redirect?: string) => {
    setView(v);
    setPendingRedirect(redirect);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setPendingRedirect(undefined);
  }, []);

  const switchView = useCallback((v: 'login' | 'register') => {
    setView(v);
  }, []);

  const value = useMemo(() => ({
    isOpen, view, pendingRedirect, openAuthModal, closeAuthModal, switchView,
  }), [isOpen, view, pendingRedirect, openAuthModal, closeAuthModal, switchView]);

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
};
