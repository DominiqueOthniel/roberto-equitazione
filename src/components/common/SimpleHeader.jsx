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
            <Link href="/" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Casa
            </Link>
            <Link href="/product-catalog" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Disponibili
            </Link>
            <Link href="/su-di-me" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Su di Me
            </Link>
            <Link href="/testimonianze" className="text-sm lg:text-base text-text-primary font-body hover:text-primary transition-fast" suppressHydrationWarning>
              Testimonianze
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
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Casa</span>
              </Link>
              <Link
                href="/product-catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Disponibili</span>
              </Link>
              <Link
                href="/su-di-me"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Su di Me</span>
              </Link>
              <Link
                href="/testimonianze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-text-primary font-body transition-fast hover:bg-muted hover:text-primary"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Testimonianze</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
