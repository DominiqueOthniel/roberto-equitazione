'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/home-hero.jpeg"
            alt="Madison Equestrian - Premium saddles"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg tracking-wide">
            {BRAND.name}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md max-w-2xl mx-auto">
            Exceptional equestrian equipment. Discover our collection of fine saddles, selected for horse and rider across the United States.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/product-catalog"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Shop the Collection
            </Link>
            <Link
              href="#about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section id="about" className="py-20 bg-background">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-text-primary mb-6">
              Passion and Excellence
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Madison Equestrian specializes in high-quality riding saddles. Our love of horsemanship and commitment to excellence are reflected in every piece we offer.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Explore a curated selection of saddles for every discipline, designed for rider comfort and horse welfare. Each saddle is chosen for quality, durability, and timeless style.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6">
              Ready to find your ideal saddle?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Browse our full catalog and find the perfect fit for you and your horse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/product-catalog"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              View the Catalog
            </Link>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg text-lg"
            >
              Chat on WhatsApp
            </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
