'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section avec image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/home-hero.jpeg"
            alt="Roberto Equitazione - Showroom de selles"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        {/* Contenu hero */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Roberto Equitazione
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md font-light">
            Excellence équestre depuis des générations
          </p>
          <p className="text-lg md:text-xl text-white/90 mb-10 drop-shadow-md max-w-2xl mx-auto">
            Découvrez notre collection exclusive de selles et équipements d'équitation de qualité supérieure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/product-catalog"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              <span>🔍</span>
              <span>Explorer le Catalogue</span>
            </Link>
            <Link
              href="/temoignages"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 rounded-lg font-semibold text-lg hover:bg-white/30 transition-all"
            >
              <span>⭐</span>
              <span>Lire les Témoignages</span>
            </Link>
            <Link
              href="/shopping-cart"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
            >
              <span>🛒</span>
              <span>Voir le Panier</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <span className="text-white/80 text-4xl">↓</span>
        </div>
      </section>

      {/* Section Bienvenue */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Bienvenue chez Roberto Equitazione
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6" />
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Votre destination pour l'excellence équestre. Nous proposons une sélection soignée
              de selles et équipements d'équitation de la plus haute qualité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Qualité Premium</h3>
              <p className="text-text-secondary">
                Chaque produit est sélectionné pour sa qualité exceptionnelle et sa durabilité.
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚚</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Livraison Rapide</h3>
              <p className="text-text-secondary">
                Expédition rapide et sécurisée pour que vous receviez vos produits en temps voulu.
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💝</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Passion Équestre</h3>
              <p className="text-text-secondary">
                Une équipe passionnée qui comprend vos besoins et vous accompagne dans vos choix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à découvrir notre collection ?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Parcourez notre catalogue et trouvez l'équipement parfait pour vous et votre cheval.
          </p>
          <Link
            href="/product-catalog"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <span>→</span>
            <span>Commencer les Achats</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
