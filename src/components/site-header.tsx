
import { MainNav } from '@/components/main-nav';
import { SearchBar } from '@/components/search-bar';
import { SiteLogo } from '@/components/site-logo';
import { UserNav } from '@/components/user-nav';
import { MessageNotifications } from '@/components/message-notifications';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container mx-auto max-w-screen-2xl px-4">
        {/* Top Row: Logo, MainNav, MessageNotifications, UserNav */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center"> {/* Group SiteLogo and MainNav together */}
            <SiteLogo />
            <MainNav className="mx-6 hidden md:flex" />
          </div>
          <div className="flex items-center space-x-3">
            <MessageNotifications />
            <UserNav />
          </div>
        </div>
        {/* Bottom Row for Search Bar */}
        <div className="py-3"> {/* Add some vertical padding for the search bar row */}
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
