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
      <span key={i} style={{
        color: i < rating ? '#FFD700' : '#E5E7EB',
        fontSize: '1.2rem'
      }}>
        ★
      </span>
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f6f3',
      padding: '2rem 1rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 'bold',
          color: '#2C1810',
          marginBottom: '1rem',
          fontFamily: 'serif'
        }}>
          Témoignages Clients
        </h1>
        <div style={{
          width: '6rem',
          height: '0.25rem',
          backgroundColor: '#8B4513',
          margin: '0 auto 1.5rem'
        }} />
        <p style={{
          fontSize: '1.25rem',
          color: '#6B5B4F',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Découvrez ce que nos clients disent de leur expérience avec Roberto Equitazione
        </p>
      </div>

      {/* Testimonials Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        padding: '0 1rem'
      }}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(139, 69, 19, 0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              {renderStars(testimonial.rating)}
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#6B5B4F'
              }}>
                {testimonial.rating}/5
              </span>
            </div>

            {/* Quote */}
            <blockquote style={{
              fontSize: '1rem',
              color: '#374151',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              "{testimonial.text}"
            </blockquote>

            {/* Product */}
            <div style={{
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#8B4513',
                fontWeight: '600'
              }}>
                Produit acheté: {testimonial.product}
              </span>
            </div>

            {/* Author */}
            <div style={{
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1rem'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C1810',
                marginBottom: '0.25rem'
              }}>
                {testimonial.name}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6B5B4F'
              }}>
                {testimonial.location} • {testimonial.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={{
        maxWidth: '800px',
        margin: '4rem auto',
        textAlign: 'center',
        backgroundColor: '#8B4513',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '1rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Votre avis compte !
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2rem',
          opacity: '0.95'
        }}>
          Partagez votre expérience avec nous et aidez d'autres cavaliers à faire le bon choix.
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <a
            href="/product-catalog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              backgroundColor: 'white',
              color: '#8B4513',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            🛍️ Découvrir nos produits
          </a>
          <p style={{
            fontSize: '0.9rem',
            opacity: '0.8',
            margin: '0'
          }}>
            Contactez-nous après votre achat pour partager votre expérience
          </p>
        </div>
      </div>
    </div>
  );
}
