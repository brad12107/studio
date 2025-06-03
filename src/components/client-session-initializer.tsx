
'use client';

import { useEffect } from 'react';

export function ClientSessionInitializer() {
  useEffect(() => {
    const persistLogin = localStorage.getItem('stayLoggedIn') === 'true';

    if (!persistLogin) {
      // If not explicitly asked to stay logged in, clear the session on app load.
      localStorage.removeItem('isLoggedIn');
    }
    // If persistLogin is true, do nothing; isLoggedIn will persist from the previous session if set.
  }, []); // Empty dependency array means this runs once on mount

  return null; // This component doesn't render anything visible
}
