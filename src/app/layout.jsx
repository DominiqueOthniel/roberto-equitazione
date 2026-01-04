import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';

export const metadata = {
  title: 'Roberto Equitazione',
  description: 'Vendita di attrezzature equestri di alta qualità',
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
        <ConditionalHeader />
        <ConditionalMain>
          {children}
        </ConditionalMain>
        <ConditionalFooter />
      </body>
    </html>
  );
}
