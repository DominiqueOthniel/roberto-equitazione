'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import CartIndicator from '@/components/common/CartIndicator';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Disponibile',
      href: '/product-catalog',
      icon: 'Squares2X2Icon',
    },
    {
      label: 'Témoignages',
      href: '/temoignages',
      icon: 'StarIcon',
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-100">
      <div className="max-w-container mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-fast hover:opacity-80">
              <svg
                width="180"
                height="40"
                viewBox="0 0 180 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-auto"
              >
                <path
                  d="M10 8C10 6.89543 10.8954 6 12 6H18C19.1046 6 20 6.89543 20 8V14C20 15.1046 19.1046 16 18 16H12C10.8954 16 10 15.1046 10 14V8Z"
                  fill="var(--color-primary)"
                />
                <path
                  d="M10 22C10 20.8954 10.8954 20 12 20H18C19.1046 20 20 20.8954 20 22V32C20 33.1046 19.1046 34 18 34H12C10.8954 34 10 33.1046 10 32V22Z"
                  fill="var(--color-accent)"
                />
                <text
                  x="32"
                  y="25"
                  fontFamily="Playfair Display, serif"
                  fontSize="20"
                  fontWeight="600"
                  fill="var(--color-primary)"
                >
                  Roberto Equitazione
                </text>
              </svg>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-text-primary font-body font-normal transition-fast hover:bg-muted hover:text-primary"
                >
                  <Icon name={item?.icon} size={20} variant="outline" />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <CartIndicator />

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
          <nav className="lg:hidden border-t border-border bg-background">
            <div className="px-4 py-2 space-y-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body font-normal transition-fast hover:bg-muted hover:text-primary"
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