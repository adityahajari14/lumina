// Storage is optional: private browsing, quotas, and browser settings must not
// prevent a customer from configuring a product or reaching checkout.
export function readStorage(key: string, session = false): string | null {
  try {
    return (session ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null, session = false) {
  try {
    const storage = session ? sessionStorage : localStorage;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // The current in-memory session/cart remains usable.
  }
}
