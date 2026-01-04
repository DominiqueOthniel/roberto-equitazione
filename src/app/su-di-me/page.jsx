'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SuDiMePage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="relative bg-muted border-b border-border py-16">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  <Image
                    src="/assets/images/roberto.jpg"
                    alt="Roberto - Fondatore di Roberto Equitazione"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 256px, 320px"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary mb-4">
                  Su di Me
                </h1>
                <p className="text-xl sm:text-2xl text-primary font-heading font-semibold mb-6">
                  Roberto Equitazione
                </p>
                <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  La passione per il cavallo e per l'equitazione alla base della mia filosofia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-16">
              <p className="text-xl text-text-secondary leading-relaxed mb-6">
                Mi chiamo Roberto e Roberto Equitazione nasce dalla mia passione per il cavallo e per l'equitazione. 
                Vivo in Italia e metto la mia esperienza e la mia sensibilità da cavaliere al servizio di chi è alla 
                ricerca di una sella da equitazione adatta, confortevole e rispettosa della morfologia del cavallo.
              </p>
            </div>

            {/* Experience Section */}
            <div className="bg-card border border-border rounded-lg p-8 lg:p-12 mb-16 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6">
                La Mia Esperienza
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Nel corso degli anni ho sviluppato una particolare attenzione per l'attrezzatura equestre, in particolare 
                per le selle da equitazione, convinto che una sella scelta correttamente sia fondamentale per il benessere 
                del cavallo, per la posizione del cavaliere e per la qualità del lavoro montato.
              </p>
            </div>

            {/* Values Section */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-8 text-center">
                La Mia Selezione
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                Propongo una selezione di selle scelte con cura, privilegiando:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                        Comfort del Cavallo
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        Il comfort e la libertà di movimento del cavallo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                        Stabilità del Cavaliere
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        L'equilibrio e la stabilità del cavaliere
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                        Qualità e Durata
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        La qualità dei materiali e la durata nel tempo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-base">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
                        Scelta Personalizzata
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        Una scelta adeguata alle reali esigenze del binomio cavallo–cavaliere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approach Section */}
            <div className="bg-muted border border-border rounded-lg p-8 lg:p-12 mb-16">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6 text-center">
                Il Mio Approccio
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto text-center mb-8">
                Il mio approccio è semplice e onesto: dedicare il tempo necessario per comprendere le vostre aspettative, 
                la disciplina praticata e le caratteristiche del vostro cavallo, per orientarvi verso la sella più adatta.
              </p>
            </div>

            {/* Vision Section */}
            <div className="bg-card border border-border rounded-lg p-8 lg:p-12 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6 text-center">
                La Mia Visione
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto text-center">
                Attraverso Roberto Equitazione, desidero condividere una visione dell'equitazione rispettosa, funzionale 
                e duratura, in cui l'attrezzatura diventa un vero alleato del cavallo e del cavaliere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted border-t border-border">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Trova la Tua Sella Ideale
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Sono qui per aiutarti a trovare la sella perfetta per te e il tuo cavallo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/product-catalog"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Esplora il Catalogo
              </Link>
              <Link
                href="mailto:robertotavernar7@gmail.com"
                className="px-8 py-4 bg-card border-2 border-primary text-primary font-semibold rounded-lg hover:bg-muted transition-all duration-300 text-lg"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

