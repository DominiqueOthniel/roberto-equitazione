'use client';

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Maria Rossi",
      location: "Milano",
      rating: 5,
      date: "15 décembre 2024",
      text: "Exceptionnel ! J'ai acheté une selle anglaise pour ma jument et la qualité est remarquable. Le cuir est souple et bien travaillé, et le confort pour ma jument est parfait. Roberto a pris le temps de me conseiller personnellement. Service irréprochable !",
      product: "Selle anglaise Prestige"
    },
    {
      id: 2,
      name: "Luca Bianchi",
      location: "Torino",
      rating: 5,
      date: "8 novembre 2024",
      text: "Très satisfait de mon achat. Les rênes que j'ai commandées sont d'excellente qualité et arrivent exactement comme décrit. La livraison a été rapide et le packaging soigné. Je recommande vivement Roberto Equitazione pour tous vos besoins équestres.",
      product: "Rênes en cuir naturel"
    },
    {
      id: 3,
      name: "Giulia Verdi",
      location: "Firenze",
      rating: 5,
      date: "22 octobre 2024",
      text: "Quelle découverte ! Je cherchais des protections pour mes chevaux depuis longtemps et j'ai trouvé exactement ce qu'il me fallait. Les tapis de selle sont de très bonne qualité et le service après-vente est excellent. Merci pour vos conseils avisés !",
      product: "Tapis de selle protecteur"
    },
    {
      id: 4,
      name: "Marco Esposito",
      location: "Napoli",
      rating: 5,
      date: "5 septembre 2024",
      text: "Professionnalisme et qualité au rendez-vous. J'ai fait confiance à Roberto pour équiper mon centre équestre et je ne regrette pas mon choix. Les produits sont durables et le rapport qualité-prix est excellent. Service client réactif et compétent.",
      product: "Équipement centre équestre"
    },
    {
      id: 5,
      name: "Anna Romano",
      location: "Roma",
      rating: 5,
      date: "18 août 2024",
      text: "Magnifique sellerie ! J'adore les finitions et la qualité du travail artisanal. Ma jument apprécie particulièrement le confort de sa nouvelle selle. Roberto m'a aidée à choisir la taille parfaite. Un vrai professionnel passionné !",
      product: "Sellerie complète western"
    },
    {
      id: 6,
      name: "Francesco Conti",
      location: "Bologna",
      rating: 5,
      date: "3 juillet 2024",
      text: "Livraison impeccable et produits de grande qualité. J'ai commandé plusieurs articles pour mon écurie et tout est arrivé en parfait état. Les brides sont exactement comme sur les photos et la solidité est au rendez-vous. Merci pour ce service de qualité !",
      product: "Brides et licols"
    },
    {
      id: 7,
      name: "Sofia Martini",
      location: "Venezia",
      rating: 5,
      date: "15 juin 2024",
      text: "Une équipe passionnée et compétente ! J'ai été impressionnée par les connaissances de Roberto sur les différentes disciplines équestres. Il m'a conseillé la selle parfaite pour mes cours de dressage. Qualité exceptionnelle et conseils précieux.",
      product: "Selle de dressage"
    },
    {
      id: 8,
      name: "Alessandro Ricci",
      location: "Genova",
      rating: 5,
      date: "28 mai 2024",
      text: "Excellent rapport qualité-prix ! J'ai trouvé des articles de grande marque à des prix très intéressants. La sélection est soignée et les produits sont authentiques. Service rapide et professionnel. Je reviendrai certainement pour mes prochains achats.",
      product: "Équipement complet"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Témoignages Clients
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-6" />
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Découvrez ce que nos clients disent de leur expérience avec Roberto Equitazione
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-primary/10">
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex">
                {renderStars(testimonial.rating)}
              </div>
              <span className="ml-2 text-sm text-text-secondary">
                {testimonial.rating}/5
              </span>
            </div>

            {/* Quote */}
            <blockquote className="text-foreground leading-relaxed mb-4 italic">
              "{testimonial.text}"
            </blockquote>

            {/* Product */}
            <div className="bg-primary/10 p-3 rounded-lg mb-4">
              <span className="text-sm text-primary font-semibold">
                Produit acheté: {testimonial.product}
              </span>
            </div>

            {/* Author */}
            <div className="border-t border-border pt-4">
              <div className="font-semibold text-foreground mb-1">
                {testimonial.name}
              </div>
              <div className="text-sm text-text-secondary">
                {testimonial.location} • {testimonial.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto mt-16 text-center bg-primary text-primary-foreground p-12 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">
          Votre avis compte !
        </h2>
        <p className="text-lg mb-8 opacity-95">
          Partagez votre expérience avec nous et aidez d'autres cavaliers à faire le bon choix.
        </p>
        <div className="flex flex-col items-center gap-4">
          <a
            href="/product-catalog"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-white/90 transition-all shadow-lg"
          >
            🛍️ Découvrir nos produits
          </a>
          <p className="text-sm opacity-80">
            Contactez-nous après votre achat pour partager votre expérience
          </p>
        </div>
      </div>
    </div>
  );
}
