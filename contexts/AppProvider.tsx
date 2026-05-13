/**
 * AppProvider with TanStack Query
 *
 * Provider hierarchy is split into tiers to reduce unnecessary nesting
 * and isolate re-renders. Independent UI-only contexts are composed
 * via ComposeProviders to keep the tree flat.
 *
 * Tier 1 (infrastructure): QueryClient, Auth
 * Tier 2 (data):           Location, Products, Filters, Cart
 * Tier 3 (UI-only):        CartDrawer, Wishlist, Compare, QuickView
 *   — these are independent of each other; grouped into a flat composite.
 */

import { ReactNode, ComponentType, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { QueryClientProvider } from '@tanstack/react-query';

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
  { ssr: false }
);
import { createQueryClient } from '../lib/queryClient';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ProductsProvider } from './ProductsContext';
import { WishlistProvider } from './WishlistContext';
import { QuickViewProvider } from './QuickViewContext';
import { FiltersProvider } from './FiltersContext';
import { CartDrawerProvider } from './CartDrawerContext';
import { LocationProvider } from './LocationContext';
import { CompareProvider } from './CompareContext';
import { AuthModalProvider } from './AuthModalContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Compose an array of providers into a single wrapper.
 * Avoids deeply nested JSX for independent contexts.
 */
const ComposeProviders = ({ providers, children }: { providers: ComponentType<{ children: ReactNode }>[]; children: ReactNode }) => {
  return providers.reduceRight<ReactNode>(
    (kids, Provider) => <Provider>{kids}</Provider>,
    children
  );
};

export const AppProvider = ({ children }: AppProviderProps) => {
  // Create QueryClient once per component lifecycle to avoid HMR issues
  const [queryClient] = useState(() => createQueryClient());

  // Memoize UI providers array to prevent stale component references
  const uiProviders = useMemo(() => [
    CartDrawerProvider,
    WishlistProvider,
    CompareProvider,
    QuickViewProvider,
    AuthModalProvider,
  ], []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <ProductsProvider>
            <FiltersProvider>
              <CartProvider>
                <ComposeProviders providers={uiProviders}>
                  {children}
                </ComposeProviders>
              </CartProvider>
            </FiltersProvider>
          </ProductsProvider>
        </LocationProvider>
      </AuthProvider>

      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default AppProvider;
