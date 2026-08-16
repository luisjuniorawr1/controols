import type { Metadata } from 'next';
import Script from 'next/script';
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
import './hacker-theme.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controols.com'),
  applicationName: 'Controols',
  title: { default: 'Controols', template: '%s | Controols' },
  description: 'Fast, private and free online tools.',
  creator: 'Controols',
  publisher: 'Controols',
  robots: { index: true, follow: true },
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
      {gaMeasurementId && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
        </Script>
      </>}
    </html>
  );
}
