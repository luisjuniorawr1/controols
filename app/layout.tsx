import type { Metadata } from 'next';
import './globals.css';
import './assets.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controols.com'),
  applicationName: 'Controols',
  title: { default: 'Controols', template: '%s | Controols' },
  description: '400 fast, private and free online tools.',
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
