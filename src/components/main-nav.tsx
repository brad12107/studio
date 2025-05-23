
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface MainNavProps extends HTMLAttributes<HTMLElement> {
  // Add any specific props if needed
}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();

  // Remove all routes to hide the main navigation links
  const routes: { href: string; label: string; active: boolean }[] = [
    // { href: '/', label: 'Browse', active: pathname === '/' },
    // { href: '/list-item', label: 'Sell', active: pathname === '/list-item' },
    // { href: '/messages', label: 'Messages', active: pathname === '/messages' || pathname?.startsWith('/messages') },
    // { href: '/subscription', label: 'Subscription', active: pathname === '/subscription' },
  ];

  if (routes.length === 0) {
    return null; // Render nothing if there are no routes
  }

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
}
