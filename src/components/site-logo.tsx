import { Store } from 'lucide-react';
import Link from 'next/link';

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Store className="h-8 w-8 text-primary" />
      <span className="font-bold text-xl text-primary-foreground bg-primary px-2 py-1 rounded-md shadow">
        Barrow Market Place
      </span>
    </Link>
  );
}
