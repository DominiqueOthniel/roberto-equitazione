import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalChatWidget from '@/components/common/ConditionalChatWidget';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Réinitialiser le flag de navigation au chargement de la page
              if (typeof window !== 'undefined') {
                window.__isNavigating = false;
              }
            `,
          }}
        />
        <ConditionalHeader />
        <ConditionalMain>
          {children}
        </ConditionalMain>
        <ConditionalFooter />
        <ConditionalChatWidget />
      </body>
    </html>
  );
}

