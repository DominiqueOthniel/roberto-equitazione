import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalChatWidget from '@/components/common/ConditionalChatWidget';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';
import NavigationInitializer from '@/components/common/NavigationInitializer';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export const metadata = {
  title: {
    default: 'Roberto Equitazione - Selle di Alta Qualità per l\'Equitazione',
    template: '%s | Roberto Equitazione',
  },
  description: 'Specialisti in selle di alta qualità per l\'equitazione. Scopri la nostra collezione di selle da dressage, salto e passeggio. Consulenza personalizzata e manutenzione professionale.',
  keywords: ['selle equitazione', 'selle cavallo', 'selle dressage', 'selle salto', 'equipaggiamento equestre', 'roberto equitazione', 'selleria', 'selle italia'],
  authors: [{ name: 'Roberto Equitazione' }],
  creator: 'Roberto Equitazione',
  publisher: 'Roberto Equitazione',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://robertoequitazione.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://robertoequitazione.com',
    siteName: 'Roberto Equitazione',
    title: 'Roberto Equitazione - Selle di Alta Qualità per l\'Equitazione',
    description: 'Specialisti in selle di alta qualità per l\'equitazione. Scopri la nostra collezione di selle da dressage, salto e passeggio.',
    images: [
      {
        url: '/assets/images/roberto.jpg',
        width: 1200,
        height: 630,
        alt: 'Roberto Equitazione',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roberto Equitazione - Selle di Alta Qualità per l\'Equitazione',
    description: 'Specialisti in selle di alta qualità per l\'equitazione. Consulenza personalizzata e manutenzione professionale.',
    images: ['/assets/images/roberto.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Ajoutez votre code de vérification Google Search Console ici
    // google: 'votre-code-de-verification',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <NavigationInitializer />
          <ConditionalHeader />
          <ConditionalMain>
            {children}
          </ConditionalMain>
          <ConditionalFooter />
          <ConditionalChatWidget />
        </ErrorBoundary>
      </body>
    </html>
  );
}

