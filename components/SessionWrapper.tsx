import { useAuth } from '../contexts/AuthContext';
import Preloader from './elements/Preloader';
import { useEffect, useState, FC, ReactNode } from 'react';

/**
 * SessionWrapper - Ensures session is ready before rendering children
 * Only blocks on initial app load, not on navigation
 */
interface SessionWrapperProps {
  children: ReactNode;
}

const SessionWrapper: FC<SessionWrapperProps> = ({ children }) => {
    const { loading } = useAuth();
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        // Only show preloader on initial app mount, not on every navigation
        if (!loading && initialLoad) {
            setInitialLoad(false);
        }

        // Safety timeout: force render after 3 seconds even if loading is stuck
        const timeout = setTimeout(() => {
            if (initialLoad) {
                setInitialLoad(false);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [loading, initialLoad]);

    // Only block rendering on the very first load
    if (loading && initialLoad) {
        return <Preloader />;
    }

    // After initial load, always render children (don't block navigation)
    return children;
};

export default SessionWrapper;
