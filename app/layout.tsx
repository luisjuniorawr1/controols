import type { Metadata } from 'next';
import './globals.css';
import './assets.css';
import './tool-clean.css';
import './dark.css';
import './home-stream.css';
import './home-compact.css';
import './collection-hub.css';
import './mobile-nav.css';
import './ux-polish.css';
import './expansion.css';
import './blog.css';
import './seo-content.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controols.com'),
  applicationName: 'Controols',
  title: { default: 'Controols', template: '%s | Controols' },
  description: 'Fast, private and free online tools.',
  creator: 'Controols',
  publisher: 'Controols',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
