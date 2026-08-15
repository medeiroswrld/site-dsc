"use client";

import { createContext, useContext } from "react";
import { STORE_DEFAULTS, type StoreInfo } from "@/lib/site-content";

/**
 * The store's own data, made available to Client Components.
 *
 * Server Components read it directly with `getStoreInfo()`. The handful of
 * interactive pieces — the WhatsApp button, the mobile bar, the menu — cannot
 * await anything, so the site layout resolves it once per request and hands it
 * down through here. One database read serves the whole page either way.
 *
 * The default is the shipped configuration rather than null, so a component
 * rendered outside the provider still shows a real phone number instead of
 * crashing or blanking.
 */
const StoreContext = createContext<StoreInfo>(STORE_DEFAULTS);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreInfo;
  children: React.ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreInfo {
  return useContext(StoreContext);
}
