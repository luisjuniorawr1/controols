import type { Metadata } from 'next';
import LayoutStudio from '@/src/components/LayoutStudio';

export const metadata: Metadata = {
  title: 'Studio de Enquadramento — CONTROOLS',
  robots: { index: false, follow: false },
};

export default function LayoutStudioPage() {
  return <LayoutStudio />;
}
