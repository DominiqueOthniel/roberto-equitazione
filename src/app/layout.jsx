import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalChatWidget from '@/components/common/ConditionalChatWidget';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';
import NavigationInitializer from '@/components/common/NavigationInitializer';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export const metadata = {
  title: 'Roberto Equitazione',
  description: 'Site de vente d\'équipements équestres',
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

