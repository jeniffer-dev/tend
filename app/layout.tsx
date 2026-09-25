import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import { StoreProvider } from '@/lib/state/provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Tend',
  description: 'A personal system for attending to a few life areas in short, deliberate sessions.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* `min-h-dvh flex flex-col` is layout mechanics, not a visual value:
          it is what puts the sticky footer's primary action at the bottom of
          the viewport rather than partway up it when a screen is short
          (Constitution Article IV, thumb reach). */}
      <body className={`${geist.variable} font-sans antialiased min-h-dvh flex flex-col`}>
        {/* Design system §4, the page container verbatim. Never the 1120px
            container, never a md:grid-cols-* layout. */}
        {/* The store sits above the router, which is what lets a running
            session survive navigation (FR-024). The layout stays a server
            component and simply renders the client provider around the
            tree. Nothing is written to any storage API (FR-023). */}
        <StoreProvider>
          <div
            data-testid="screen"
            className="w-full max-w-[720px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 space-y-4 flex-1 flex flex-col"
          >
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
