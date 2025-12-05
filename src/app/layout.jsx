import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalChatWidget from '@/components/common/ConditionalChatWidget';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';

export const metadata = {
  title: 'Roberto Equitazione',
  description: 'Site de vente d\'équipements équestres',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-screen flex flex-col">
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

