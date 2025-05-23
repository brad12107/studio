
'use client';

// Link and usePathname are no longer needed as routes array is empty
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface MainNavProps extends HTMLAttributes<HTMLElement> {
  // Add any specific props if needed
}

export function MainNav({ className, ...props }: MainNavProps) {
  // const pathname = usePathname(); // Removed as routes array is empty

  // The routes array is intentionally empty as per previous user request
  const routes: { href: string; label: string; active: boolean }[] = [];

  if (routes.length === 0) {
    return null; // Render nothing if there are no routes
  }

  // This part of the code is currently unreachable because routes.length is always 0
  /*
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-primary font-semibold underline underline-offset-4' : 'text-foreground/80'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
  */
}
