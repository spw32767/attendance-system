import { createContext, useContext } from "react";

/**
 * Cross-cutting session state for chrome that lives outside the page tree
 * (AdminLayout's user menu, change-password modal). Pages don't need to
 * thread these through — they read from this context directly.
 */
const SessionContext = createContext({
  sessionUser: null,
  onChangeOwnPassword: async () => {
    throw new Error("SessionContext not provided");
  }
});

export const SessionProvider = SessionContext.Provider;

export const useSession = () => useContext(SessionContext);
