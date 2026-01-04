'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/home-hero.jpeg"
            alt="Roberto Equitazione - Selle d'equitazione"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg">
            Roberto Equitazione
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md max-w-2xl mx-auto">
            L'eccellenza dell'attrezzatura equestre. Scopri la nostra collezione di selle d'eccezione
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/product-catalog"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Scopri il Catalogo
            </Link>
            <Link
              href="#about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-lg"
            >
              Scopri di più
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
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

      {/* Section About */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-text-primary mb-6">
              Passione ed Eccellenza
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Da anni, Roberto Equitazione si specializza nella vendita di selle d'equitazione di alta qualità.
              La nostra passione per l'equitazione e il nostro impegno verso l'eccellenza si riflettono in ogni prodotto che proponiamo.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Scopri una selezione curata di selle per tutte le discipline, concepite per il comfort del cavaliere
              e il benessere del cavallo. Ogni sella è scelta per la sua qualità, durabilità ed estetica.
            </p>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 bg-muted">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6">
              Pronto a trovare la tua sella ideale?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Esplora il nostro catalogo completo e trova la sella perfetta per te e il tuo cavallo.
            </p>
            <Link
              href="/product-catalog"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              Vedi il Catalogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
