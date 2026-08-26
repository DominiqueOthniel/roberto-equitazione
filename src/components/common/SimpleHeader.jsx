'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartIndicator from './CartIndicator';
import { BRAND } from '@/lib/brand';

export default function SimpleHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-100">
      <div className="max-w-container mx-auto">
        <div className="flex items-center justify-between h-20 px-4 lg:px-6">
          <Link href="/" className="flex items-center transition-fast hover:opacity-80">
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={180}
              height={180}
              className="h-14 sm:h-16 w-auto"
              priority
              suppressHydrationWarning
            />
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6" suppressHydrationWarning>
            <Link href="/" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Home
            </Link>
            <Link href="/product-catalog" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Shop
            </Link>
            <Link href="/su-di-me" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              About Me
            </Link>
            <Link href="/testimonianze" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Reviews
            </Link>
            <CartIndicator />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <CartIndicator />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md transition-fast hover:bg-muted"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-background" suppressHydrationWarning>
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <span>Home</span>
              </Link>
              <Link
                href="/product-catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <span>Shop</span>
              </Link>
              <Link
                href="/su-di-me"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <span>About Me</span>
              </Link>
              <Link
                href="/testimonianze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <span>Reviews</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
