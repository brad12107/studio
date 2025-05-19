import { MainNav } from '@/components/main-nav';
import { SearchBar } from '@/components/search-bar';
import { SiteLogo } from '@/components/site-logo';
import { UserNav } from '@/components/user-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <SiteLogo />
        <MainNav className="mx-6 hidden md:flex" />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar />
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
