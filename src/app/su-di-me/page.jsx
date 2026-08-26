'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export default function SuDiMePage() {
  return (
    <div className="min-h-screen bg-background pt-4">
      <section className="relative bg-muted border-b border-border py-16">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="flex-shrink-0">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-[#FDFBF7]">
                  <Image
                    src={BRAND.logo}
                    alt={`${BRAND.name} logo`}
                    fill
                    className="object-contain p-6"
                    priority
                    sizes="(max-width: 1024px) 256px, 320px"
                  />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary mb-4">
                  About Us
                </h1>
                <p className="text-xl sm:text-2xl text-primary font-heading font-semibold mb-6">
                  {BRAND.name}
                </p>
                <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  A passion for the horse and for riding at the heart of everything we do
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-16">
              <p className="text-xl text-text-secondary leading-relaxed mb-6">
                Madison Equestrian was built from a genuine love of horses and horsemanship.
                Based in the United States, we put rider experience and a careful eye for fit
                at the service of anyone looking for a saddle that is comfortable, well made,
                and respectful of the horse’s conformation.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 lg:p-12 mb-16 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6">
                Our Experience
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Over the years we have developed a particular focus on saddles, convinced that
                the right choice is essential for the horse’s comfort, the rider’s position,
                and the quality of the work under saddle.
              </p>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-8 text-center">
                Our Selection
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                We offer a carefully chosen range of saddles, with priority given to:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                    Horse Comfort
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Freedom of movement and comfort for the horse
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                    Rider Stability
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Balance and a secure, correct position
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                    Quality and Longevity
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Materials that last and hold their shape
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                    Personal Fit
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    A choice that matches the real needs of horse and rider
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted border border-border rounded-lg p-8 lg:p-12 mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6 text-center">
                Our Approach
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto text-center">
                Our approach is simple and honest: take the time to understand your goals,
                your discipline, and your horse, then guide you toward the saddle that fits.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 lg:p-12 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6 text-center">
                Our Vision
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto text-center">
                Through Madison Equestrian, we share a respectful, functional, and lasting
                vision of riding—where equipment is a true partner for horse and rider.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted border-t border-border">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Find Your Ideal Saddle
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              We are here to help you find the perfect saddle for you and your horse
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/product-catalog"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Explore the Catalog
              </Link>
              <Link
                href={`mailto:${BRAND.email}`}
                className="px-8 py-4 bg-card border-2 border-primary text-primary font-semibold rounded-lg hover:bg-muted transition-all duration-300 text-lg"
              >
                Email Us
              </Link>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#25D366] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 text-lg"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
