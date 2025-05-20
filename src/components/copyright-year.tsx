
'use client';

import { useState, useEffect } from 'react';

export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) {
    // You can return a placeholder or null during server render / initial client render before useEffect runs
    return null; 
  }

  return <>{year}</>;
}
