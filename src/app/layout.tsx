import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource-variable/space-grotesk';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOESIS — Enter the Inner World',
  description:
    'An immersive journey into psychology, emotion and consciousness. Explore how the mind works — and the invisible forces shaping the human experience.',
  applicationName: 'NOESIS',
  keywords: ['psychology', 'consciousness', 'emotions', 'self-awareness', 'emotional intelligence', 'mind'],
  openGraph: {
    title: 'NOESIS — Enter the Inner World',
    description: 'Understand what moves within. An immersive journey into psychology, emotion and consciousness.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'NOESIS — Enter the Inner World' },
};

export const viewport: Viewport = {
  themeColor: '#02020a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <noscript>
          <style>{`.loader{display:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
