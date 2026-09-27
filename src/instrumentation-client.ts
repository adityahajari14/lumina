import { initializeStoreSession } from './lib/store-session';

// Run before hydration/client navigation can remove the landing URL's UTMs.
initializeStoreSession();
