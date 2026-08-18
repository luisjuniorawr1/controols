import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './kids-game.css';
import './tv-viewport.css';
import './kids-readable.css';
import './kids-stage-v2.css';
import './title-overlay-fix.css';
import './kids-fullscreen-scenes.css';
import './kids-scenes-v2.css';
import './kids-scenes-v2-fixes.css';
import './kids-game-v3.css';
import './kids-right-panel-readable.css';
import './library-card-right-safe-zone.css';
import './kids-library-stream.css';
import './marketing-home.css';
import './scroll-modes.css';
import './marketing-home-refine.css';
import './marketing-horizontal.css';
import './marketing-horizontal-fixes.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controols.com'),
  applicationName: 'CONTROOLS',
  title: { default: 'CONTROOLS', template: '%s | CONTROOLS' },
  description: 'Um universo de jogos e aventuras para crianças explorarem diferentes temas por meio de histórias, desafios e descobertas.',
  creator: 'CONTROOLS',
  publisher: 'CONTROOLS',
  robots: { index: true, follow: true },
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
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
