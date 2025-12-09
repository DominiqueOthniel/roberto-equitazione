'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/roberto_equitazione?igsh=MWNpeGFmdmNoZ2hvbg%3D%3D&utm_source=qr',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@roberto.tavernar3',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/17hkJwLkpq/?mibextid=wwXIfr',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const faqData = [
    {
      question: 'Come scegliere la misura corretta della sella?',
      answer: 'La misura della sella dipende dalla lunghezza della coscia del cavaliere e dalla conformazione del cavallo. Una sella troppo piccola limita la libertà di movimento, mentre una troppo grande può causare instabilità. Consigliamo sempre di provare la sella prima dell\'acquisto e, se possibile, farsi consigliare da un sellaro professionista che valuterà sia le tue esigenze che quelle del tuo cavallo.',
    },
    {
      question: 'Qual è la differenza tra una sella da dressage e una da salto?',
      answer: 'Le selle da dressage hanno boccagli più lunghi e profondi per favorire una posizione più seduta e allungata, ideale per l\'addestramento classico. Le selle da salto hanno boccagli più corti e piatti, con pannelli più corti per permettere al cavallo maggiore libertà di movimento durante gli ostacoli. La scelta dipende dalla disciplina che pratichi.',
    },
    {
      question: 'Quanto spesso devo fare la manutenzione della sella?',
      answer: 'La manutenzione regolare è fondamentale per preservare la qualità e la durata della sella. Consigliamo di pulire la sella dopo ogni utilizzo con prodotti specifici per il cuoio, controllare mensilmente le cuciture e le fibbie, e fare una revisione completa da un sellaro almeno una volta all\'anno. Una sella ben curata può durare decenni.',
    },
    {
      question: 'Le selle in pelle sintetica sono una buona alternativa?',
      answer: 'Le selle sintetiche sono più economiche e facili da pulire, ideali per principianti o per uso intensivo. Tuttavia, le selle in pelle naturale offrono maggiore comfort, durata e adattabilità nel tempo. La pelle si modella naturalmente al cavallo e al cavaliere, creando un\'esperienza di guida superiore. Per un investimento a lungo termine, consigliamo sempre la pelle naturale.',
    },
    {
      question: 'Come capisco se la sella calza bene al mio cavallo?',
      answer: 'Una sella ben adattata non deve creare punti di pressione, deve permettere il passaggio di due dita tra il pomello e il garrese, e deve distribuire uniformemente il peso. Segnali di una sella non adatta includono: scollature, zone di sudore asimmetriche, comportamento irrequieto del cavallo, o difficoltà nel mantenere l\'equilibrio. Un sellaro professionista può valutare l\'adattamento con precisione.',
    },
    {
      question: 'Cosa significa "sella su misura"?',
      answer: 'Una sella su misura viene costruita specificamente per le misure del tuo cavallo e le tue esigenze personali. Questo processo include la presa delle impronte del dorso del cavallo, la scelta del tipo di pannelli, la forma del boccaglio e altri dettagli personalizzati. È l\'opzione migliore per cavalli con conformazioni particolari o cavalieri che cercano la perfezione assoluta.',
    },
    {
      question: 'Quanto tempo serve per "rompere" una nuova sella?',
      answer: 'Una nuova sella richiede un periodo di rodaggio di circa 20-30 ore di utilizzo per adattarsi completamente al dorso del cavallo. Durante questo periodo, è importante controllare regolarmente che non si formino punti di pressione e alternare l\'uso con la vecchia sella se possibile. La pazienza in questa fase garantirà anni di comfort.',
    },
    {
      question: 'Le selle usate sono una buona scelta?',
      answer: 'Le selle usate possono essere un\'ottima opzione se sono in buone condizioni e ben adattate. Controlla sempre le cuciture, lo stato del cuoio, l\'integrità dell\'albero e la presenza di eventuali crepe. Una sella usata di qualità, magari di una marca prestigiosa, può offrire un rapporto qualità-prezzo eccellente rispetto a una nuova di fascia media.',
    },
  ];

  const articles = [
    {
      id: 1,
      title: 'Guida Completa alla Scelta della Sella Perfetta',
      category: 'Selle',
      excerpt: 'Scopri come selezionare la sella ideale per te e il tuo cavallo. Una guida approfondita che ti aiuterà a fare la scelta giusta.',
      content: 'La scelta della sella è uno degli aspetti più importanti nell\'equitazione. Una sella ben adattata non solo garantisce comfort per il cavaliere, ma anche benessere per il cavallo. In questa guida completa, esploreremo tutti i fattori da considerare: dalla misura corretta alla conformazione del cavallo, dal tipo di disciplina praticata alla qualità dei materiali. Imparerai a riconoscere i segnali di una sella non adatta e come collaborare con un sellaro professionista per trovare la soluzione perfetta.',
      date: '15 Gennaio 2024',
      readTime: '8 min',
    },
    {
      id: 2,
      title: 'Manutenzione e Cura delle Selle in Pelle: I Segreti dei Professionisti',
      category: 'Manutenzione',
      excerpt: 'Tecniche professionali per mantenere la tua sella in perfetto stato per decenni. Consigli pratici e prodotti consigliati.',
      content: 'Una sella ben curata può durare una vita intera. La manutenzione regolare è essenziale per preservare la qualità del cuoio, mantenere la flessibilità e prevenire crepe o danni strutturali. In questo articolo, condivideremo i segreti dei sellari professionisti: dalla pulizia quotidiana alle tecniche di condizionamento, dalla protezione contro gli agenti atmosferici alla conservazione durante i periodi di inattività. Scoprirai anche quali prodotti utilizzare e quali evitare per non danneggiare il cuoio pregiato.',
      date: '22 Gennaio 2024',
      readTime: '6 min',
    },
    {
      id: 3,
      title: 'Dressage vs Salto: Differenze Fondamentali nelle Selle',
      category: 'Discipline',
      excerpt: 'Comprendi le differenze tra selle da dressage e da salto, e come queste influenzano la tua performance e quella del cavallo.',
      content: 'Ogni disciplina equestre richiede attrezzature specifiche progettate per ottimizzare le performance. Le selle da dressage sono caratterizzate da boccagli lunghi e profondi che favoriscono una posizione seduta e allungata, essenziale per l\'addestramento classico. Al contrario, le selle da salto hanno boccagli più corti e piatti, con pannelli ridotti che permettono maggiore libertà di movimento durante gli ostacoli. Questo articolo approfondisce le caratteristiche tecniche, i vantaggi di ciascun tipo e come scegliere in base al tuo livello e alle tue aspirazioni competitive.',
      date: '28 Gennaio 2024',
      readTime: '7 min',
    },
    {
      id: 4,
      title: 'L\'Importanza dell\'Adattamento della Sella al Cavallo',
      category: 'Salute del Cavallo',
      excerpt: 'Scopri perché un adattamento corretto è fondamentale per la salute del tuo cavallo e come riconoscere i problemi.',
      content: 'Una sella mal adattata può causare seri problemi di salute al cavallo, inclusi dolori muscolari, scollature e persino problemi comportamentali. L\'adattamento corretto non è solo una questione di comfort, ma di benessere equino. Questo articolo ti guiderà attraverso i segnali da osservare: zone di sudore asimmetriche, comportamento irrequieto, difficoltà nel mantenere l\'andatura. Imparerai anche come un sellaro professionista valuta l\'adattamento utilizzando tecniche specifiche e perché investire in una sella su misura può essere la scelta migliore per cavalli con conformazioni particolari.',
      date: '5 Febbraio 2024',
      readTime: '9 min',
    },
    {
      id: 5,
      title: 'Selle Usate: Guida all\'Acquisto Consapevole',
      category: 'Acquisti',
      excerpt: 'Tutto quello che devi sapere prima di acquistare una sella usata. Come valutare qualità, condizioni e valore.',
      content: 'Acquistare una sella usata può essere un\'ottima scelta economica, ma richiede attenzione e conoscenza. In questa guida completa, ti insegneremo come ispezionare una sella usata: controllare l\'integrità dell\'albero, valutare lo stato del cuoio, verificare le cuciture e identificare eventuali danni nascosti. Scoprirai anche come riconoscere una sella di qualità anche se usata, quali marche mantengono meglio il valore nel tempo, e quando è meglio investire in una sella nuova piuttosto che usata. Con i nostri consigli, farai un acquisto consapevole e sicuro.',
      date: '12 Febbraio 2024',
      readTime: '10 min',
    },
    {
      id: 6,
      title: 'Tecnologie Moderne nelle Selle: Innovazione e Tradizione',
      category: 'Tecnologia',
      excerpt: 'Esplora le ultime innovazioni nel mondo delle selle: materiali avanzati, sistemi di bilanciamento e design ergonomico.',
      content: 'Il mondo delle selle sta vivendo una rivoluzione tecnologica, combinando tradizione artigianale con innovazioni moderne. Nuovi materiali come il cuoio tecnico, sistemi di bilanciamento avanzati, pannelli anatomici modulari e design ergonomici stanno trasformando l\'esperienza equestre. Questo articolo esplora le ultime tendenze: dalle selle con sistemi di ammortizzazione integrati alle tecnologie di adattamento dinamico. Scoprirai come queste innovazioni migliorano comfort, prestazioni e benessere, mantenendo però la qualità e l\'artigianalità che caratterizzano le migliori selle tradizionali.',
      date: '19 Febbraio 2024',
      readTime: '8 min',
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  const footerLinks = {
    navigazione: [
      { label: 'Catalogo Selle', href: '/product-catalog' },
      { label: 'Il Mio Account', href: '/user-dashboard' },
      { label: 'Carrello', href: '/shopping-cart' },
      { label: 'Storia Ordini', href: '/order-history' },
    ],
    informazioni: [
      { label: 'Chi Siamo', href: '#' },
      { label: 'Contatti', href: '#' },
      { label: 'Spedizioni', href: '#' },
      { label: 'Resi e Rimborsi', href: '#' },
    ],
  };

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="max-w-container mx-auto px-4 lg:px-6">
        {/* Articles Section */}
        <div className="py-12 border-b border-border">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
              Articoli e Guide
            </h2>
            <p className="text-text-secondary text-base">
              Esplora i nostri articoli approfonditi su selle, equitazione e cura del cavallo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm transition-base hover:shadow-md group"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {article.category}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {article.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-heading font-bold text-text-primary mb-2 group-hover:text-primary transition-fast">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {article.date}
                    </span>
                    <button
                      onClick={() => toggleArticle(article.id)}
                      className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {expandedArticle === article.id ? 'Leggi meno' : 'Leggi tutto'}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedArticle === article.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {expandedArticle === article.id && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <p className="text-sm text-text-secondary leading-relaxed font-body">
                      {article.content}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-12 border-b border-border">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
              Domande Frequenti
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Trova risposte alle domande più comuni sull'equitazione e la scelta della sella perfetta
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm transition-base hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-fast"
                  aria-expanded={openFaqIndex === index}
                >
                  <span className="font-body font-semibold text-text-primary pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-text-secondary leading-relaxed font-body">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links and Info */}
        <div className="py-12 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <Link href="/" className="flex items-center mb-4 transition-fast hover:opacity-80">
              <Image
                src="/assets/images/roberto.jpg"
                alt="Roberto Equitazione"
                width={180}
                height={40}
                className="h-10 w-auto"
                priority
                suppressHydrationWarning
              />
            </Link>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Specialisti in selle di alta qualità per l'equitazione. La tua passione, la nostra esperienza.
              </p>
              <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-fast"
                aria-label={`Visita il nostro ${social.name}`}
              >
                {social.icon}
              </a>
            ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Navigazione</h3>
              <ul className="space-y-2">
                {footerLinks.navigazione.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Informazioni</h3>
              <ul className="space-y-2">
                {footerLinks.informazioni.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Contatti</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a
                    href="mailto:robertotavernar7@gmail.com"
                    className="text-text-secondary hover:text-primary transition-fast flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    robertotavernar7@gmail.com
                  </a>
                </li>
                <li>
                  <p className="text-xs text-text-secondary mt-2">
                    Siamo disponibili per consulenze personalizzate sulla scelta della sella perfetta.
                  </p>
                </li>
              </ul>
            </div>
          </div>
          </div>

        {/* Footer Bottom */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary font-body text-center md:text-left">
              © {new Date().getFullYear()} Roberto Equitazione. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-6 text-xs text-text-secondary">
              <Link href="#" className="hover:text-primary transition-fast">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-fast">
                Termini di Servizio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

