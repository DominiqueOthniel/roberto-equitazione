'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartIndicator from './CartIndicator';

export default function SimpleHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-100">
      <div className="max-w-container mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <Link href="/" className="flex items-center transition-fast hover:opacity-80">
            <Image
              src="/assets/images/roberto.jpg"
              alt="Roberto Equitazione"
              width={180}
              height={40}
              className="h-8 sm:h-10 lg:h-12 w-auto"
              priority
              suppressHydrationWarning
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6" suppressHydrationWarning>
            <Link href="/product-catalog" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Catalogo
            </Link>
            <CartIndicator />
          </nav>

          {/* Mobile Navigation Icons */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-background" suppressHydrationWarning>
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/product-catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Catalogo</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

