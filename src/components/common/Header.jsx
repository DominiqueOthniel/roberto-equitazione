'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import CartIndicator from '@/components/common/CartIndicator';
import UserAccountMenu from '@/components/common/UserAccountMenu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Catalogo',
      href: '/product-catalog',
      icon: 'ViewGridIcon',
    },
    {
      label: 'Il Mio Account',
      href: '/user-dashboard',
      icon: 'UserIcon',
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-100 shadow-sm">
      <div className="max-w-container mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-fast hover:opacity-80">
              <Image
                src="/assets/images/roberto.jpg"
                alt="Roberto Equitazione"
                width={180}
                height={40}
                className="h-12 w-auto"
                priority
                suppressHydrationWarning
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1" suppressHydrationWarning>
              {navigationItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-text-primary font-body font-normal transition-fast hover:bg-muted hover:text-primary"
                  suppressHydrationWarning
                >
                  <Icon name={item?.icon} size={20} variant="outline" />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <CartIndicator />
            <UserAccountMenu />

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md transition-fast hover:bg-muted"
              aria-label="Toggle mobile menu"
            >
              <Icon
                name={isMobileMenuOpen ? 'XIcon' : 'MenuIcon'}
                size={24}
                variant="outline"
              />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-background" suppressHydrationWarning>
            <div className="px-4 py-2 space-y-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body font-normal transition-fast hover:bg-muted hover:text-primary"
                  suppressHydrationWarning
                >
                  <Icon name={item?.icon} size={20} variant="outline" />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}