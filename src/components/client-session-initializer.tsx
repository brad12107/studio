
'use client';

import { useEffect } from 'react';

export function ClientSessionInitializer() {
  useEffect(() => {
    // This effect runs once on the client when the app loads.
    // For the prototype requirement "always start logged out", we clear the flag.
    localStorage.removeItem('isLoggedIn');
  }, []); // Empty dependency array means this runs once on mount

  return null; // This component doesn't render anything visible
}
