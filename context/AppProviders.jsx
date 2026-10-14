"use client";

import { CountryProvider } from "./CountryContext";
import { CurrencyProvider } from "./CurrencyContext";
import { LocaleProvider } from "./LocaleContext";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { AuthProvider } from "./AuthContext";

/**
 * Single app-wide provider tree. Order matters: Country drives Currency and
 * Locale, so it must sit outermost. Auth, Cart and Wishlist are independent.
 */
export function AppProviders({ children }) {
  return (
    <CountryProvider>
      <CurrencyProvider>
        <LocaleProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>{children}</CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </LocaleProvider>
      </CurrencyProvider>
    </CountryProvider>
  );
}
