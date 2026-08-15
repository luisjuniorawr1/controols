import type { Metadata } from 'next';
import './globals.css';
import './assets.css';

export const metadata: Metadata = {
  title: { default: 'Controols', template: '%s | Controols' },
  description: '400 fast, private and free online tools.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
