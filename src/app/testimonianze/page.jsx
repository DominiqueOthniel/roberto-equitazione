'use client';

import Link from 'next/link';

export default function TestimonianzePage() {
  const testimonianze = [
    {
      id: 1,
      nome: 'Alessandro Rossi',
      data: '12 Gennaio 2025',
      rating: 5,
      testo: 'Sella eccezionale! La qualità del cuoio è superiore a qualsiasi cosa abbia mai provato. Il mio cavallo sembra molto più a suo agio durante le sessioni di dressage. Servizio clienti eccellente e consigli molto professionali.',
      disciplina: 'Dressage',
      citta: 'Milano'
    },
    {
      id: 2,
      nome: 'Maria Bianchi',
      data: '25 Gennaio 2025',
      rating: 5,
      testo: 'Acquistata per il salto ostacoli e sono rimasta entusiasta. La sella è perfettamente bilanciata e offre un ottimo supporto. Dopo 3 mesi di utilizzo intenso, è ancora in perfette condizioni. Consigliatissima!',
      disciplina: 'Salto Ostacoli',
      citta: 'Roma'
    },
    {
      id: 3,
      nome: 'Giuseppe Ferrari',
      data: '8 Febbraio 2025',
      rating: 5,
      testo: 'Roberto Equitazione mi ha aiutato a trovare la sella su misura perfetta per il mio cavallo. Il processo di consulenza è stato professionale e attento. La sella si adatta perfettamente e il mio cavallo non ha mai mostrato segni di disagio. Investimento che vale ogni euro.',
      disciplina: 'Volteggio',
      citta: 'Torino'
    },
    {
      id: 4,
      nome: 'Francesca Romano',
      data: '18 Febbraio 2025',
      rating: 5,
      testo: 'Ho acquistato la mia seconda sella da Roberto Equitazione. La prima l\'ho usata per 8 anni ed era ancora in ottime condizioni quando ho deciso di aggiornarmi. La qualità è davvero superiore e la durata nel tempo è garantita. Ottima anche la spedizione.',
      disciplina: 'Dressage',
      citta: 'Firenze'
    },
    {
      id: 5,
      nome: 'Marco Conti',
      data: '3 Marzo 2025',
      rating: 5,
      testo: 'Servizio eccellente dall\'inizio alla fine. Mi hanno consigliato la sella giusta per la conformazione particolare del mio cavallo. Dopo 2 mesi di utilizzo, posso confermare che è perfetta. Il mio istruttore ha notato subito la differenza positiva nella postura del cavallo.',
      disciplina: 'Salto Ostacoli',
      citta: 'Bologna'
    },
    {
      id: 6,
      nome: 'Laura Esposito',
      data: '15 Marzo 2025',
      rating: 5,
      testo: 'Finalmente una sella che si adatta sia a me che al mio cavallo! Comodissima, ben fatta e con un design elegante. Ho fatto molte ricerche prima dell\'acquisto e Roberto Equitazione è stata la scelta migliore. Rapporto qualità-prezzo eccellente.',
      disciplina: 'Escursionismo',
      citta: 'Napoli'
    },
    {
      id: 7,
      nome: 'Davide Lombardi',
      data: '28 Marzo 2025',
      rating: 5,
      testo: 'Acquistata per la mia figlia che pratica dressage a livello agonistico. La sella è leggera ma robusta, perfetta per le competizioni. La finitura è impeccabile e ogni dettaglio è curato alla perfezione. Soddisfatti al 100%!',
      disciplina: 'Dressage',
      citta: 'Verona'
    },
    {
      id: 8,
      nome: 'Chiara Ricci',
      data: '5 Aprile 2025',
      rating: 5,
      testo: 'Dopo anni di selle economiche, ho deciso di investire in qualità. Questa sella è tutto quello che cercavo: comfort, durata e stile. Il mio cavallo è molto più rilassato e io mi sento più sicura durante l\'allenamento. Non tornerò mai più alle selle di bassa qualità.',
      disciplina: 'Salto Ostacoli',
      citta: 'Genova'
    },
    {
      id: 9,
      nome: 'Stefano Moretti',
      data: '14 Aprile 2025',
      rating: 5,
      testo: 'Sella fantastica! Ho sempre avuto problemi con le selle che non si adattavano correttamente al mio cavallo. Questa è perfetta e ha risolto completamente il problema. Il servizio di consulenza è stato fondamentale per trovare la soluzione giusta.',
      disciplina: 'Volteggio',
      citta: 'Palermo'
    },
    {
      id: 10,
      nome: 'Elena Marchetti',
      data: '22 Aprile 2025',
      rating: 5,
      testo: 'La qualità del cuoio è eccezionale e la lavorazione artigianale è evidente in ogni dettaglio. Ho acquistato anche gli accessori corrispondenti e tutto è perfetto. Consiglierei Roberto Equitazione a chiunque cerchi selle di alta qualità.',
      disciplina: 'Dressage',
      citta: 'Venezia'
    },
    {
      id: 11,
      nome: 'Luca Rizzo',
      data: '1 Maggio 2025',
      rating: 5,
      testo: 'Acquistata per il centro ippico dove lavoro. Abbiamo bisogno di selle resistenti e affidabili e questa soddisfa tutte le nostre esigenze. Dopo 6 mesi di utilizzo intensivo con diversi cavalieri, è ancora in condizioni perfette. Ottima scelta per un uso professionale.',
      disciplina: 'Ippoterapia',
      citta: 'Padova'
    },
    {
      id: 12,
      nome: 'Sofia De Luca',
      data: '10 Maggio 2025',
      rating: 5,
      testo: 'Sono rimasta colpita dalla cura dei dettagli e dalla professionalità del team. Mi hanno guidato nella scelta della misura corretta e hanno fornito consigli preziosi sulla manutenzione. La sella è bellissima e funzionale. Grazie mille!',
      disciplina: 'Salto Ostacoli',
      citta: 'Brescia'
    },
    {
      id: 13,
      nome: 'Andrea Fontana',
      data: '5 Dicembre 2025',
      rating: 5,
      testo: 'Regalo di Natale perfetto per mia moglie che pratica equitazione da anni. La sella è stata scelta con l\'aiuto di Roberto che ha mostrato una grande conoscenza e passione. Mia moglie è entusiasta e il cavallo sembra molto più a suo agio. Servizio impeccabile!',
      disciplina: 'Dressage',
      citta: 'Parma'
    },
    {
      id: 14,
      nome: 'Valentina Galli',
      data: '12 Dicembre 2025',
      rating: 5,
      testo: 'Acquistata appena in tempo per le vacanze natalizie. La spedizione è stata velocissima e la sella è arrivata in perfette condizioni. La qualità è superiore alle aspettative e il prezzo è più che ragionevole per quello che offre. Consigliatissima!',
      disciplina: 'Salto Ostacoli',
      citta: 'Modena'
    },
    {
      id: 15,
      nome: 'Riccardo Santoro',
      data: '18 Dicembre 2025',
      rating: 5,
      testo: 'Roberto ha capito immediatamente le nostre esigenze per il centro di ippoterapia. La sella scelta è perfetta per i nostri bisogni specifici e i nostri clienti sono molto soddisfatti. Professionalità e attenzione ai dettagli fanno la differenza. Torneremo sicuramente!',
      disciplina: 'Ippoterapia',
      citta: 'Reggio Emilia'
    },
    {
      id: 16,
      nome: 'Giorgia Martini',
      data: '22 Dicembre 2025',
      rating: 5,
      testo: 'Acquistata come regalo per me stessa dopo aver ricevuto il bonus. Non potevo fare scelta migliore! La sella è comodissima, elegante e di qualità eccellente. Il mio cavallo la adora e io mi sento molto più sicura durante le lezioni. Perfetta per iniziare il nuovo anno!',
      disciplina: 'Dressage',
      citta: 'Mantova'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-primary' : 'text-border'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header Section */}
      <section className="bg-muted border-b border-border py-12">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary mb-4">
              Testimonianze
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Scopri cosa dicono i nostri clienti sulle nostre selle d'equitazione
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonianze.map((testimonianza) => (
              <div
                key={testimonianza.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-base"
              >
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(testimonianza.rating)}
                </div>

                {/* Testo */}
                <p className="text-text-secondary leading-relaxed mb-6">
                  "{testimonianza.testo}"
                </p>

                {/* Informazioni Cliente */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-heading font-semibold text-lg">
                          {testimonianza.nome.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-text-primary">
                          {testimonianza.nome}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {testimonianza.citta}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {testimonianza.data}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded-md text-text-secondary font-semibold text-xs">
                      {testimonianza.disciplina}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Voglio lasciare una testimonianza
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              La tua esperienza è importante per noi. Condividi la tua opinione e aiuta altri cavalieri a fare la scelta giusta.
            </p>
            <Link
              href="mailto:robertotavernar7@gmail.com?subject=Testimonianza Roberto Equitazione"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              Scrivi una Testimonianza
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

