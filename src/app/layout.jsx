import '@/styles/index.css';
import ConditionalHeader from '@/components/common/ConditionalHeader';
import ConditionalMain from '@/components/common/ConditionalMain';
import ConditionalFooter from '@/components/common/ConditionalFooter';

export const metadata = {
  title: 'Madison Equestrian',
  description:
    'Premium equestrian saddles and tack in the United States. Quality, comfort, and classic craftsmanship for horse and rider.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
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
