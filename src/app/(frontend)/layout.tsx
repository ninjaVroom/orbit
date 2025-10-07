import type { Metadata, Viewport } from 'next';
import { Outfit, Onest, JetBrains_Mono } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import { ToastProvider } from '@/components/ui';
import './globals.css';
import './site.css';
import './app.css';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '500'], variable: '--f-outfit', display: 'swap' });
const onest = Onest({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-onest', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--f-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'orbit: the agency operating system', template: 'orbit · %s' },
  description: 'Projects, team, client approvals and invoices in one place. Clients get their own portal; your board stays yours.',
  icons: { icon: '/svg/favicon.svg' },
  openGraph: { title: 'orbit. your agency, in sync.', description: 'Approve in the portal, watch the board and the invoice follow.', locale: 'en_CA', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#101326' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${outfit.variable} ${onest.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <ToastProvider>
          <StoreProvider>{children}</StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
