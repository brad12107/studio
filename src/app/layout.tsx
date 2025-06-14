
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from "@/components/ui/toaster";
import { CopyrightYear } from '@/components/copyright-year';
import { ClientSessionInitializer } from '@/components/client-session-initializer'; // Import the new component

// Metadata can still be exported from a client component layout
export const metadata: Metadata = {
  title: 'Barrow Market Place',
  description: 'A place to buy and sell items in your community.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <ClientSessionInitializer /> {/* Add the client component here */}
        <SiteHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-6 md:px-8 md:py-0 border-t bg-background">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
              &copy; <CopyrightYear /> Barrow Market Place. All rights reserved.
            </p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
