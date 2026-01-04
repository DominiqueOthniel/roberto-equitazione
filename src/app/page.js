export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f6f3',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Hero Section avec image */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Image de fond */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}>
          <img
            src="/assets/images/home-hero.jpeg"
            alt="Roberto Equitazione - Showroom de selles"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Overlay pour améliorer la lisibilité */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to-b, rgba(0,0,0,0.4), rgba(0,0,0,0.3))'
          }} />
        </div>

        {/* Contenu hero */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 1rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            fontFamily: 'serif'
          }}>
            Roberto Equitazione
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '2rem',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            fontWeight: 'light'
          }}>
            Excellence équestre depuis des générations
          </p>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2.5rem',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Découvrez notre collection exclusive de selles et équipements d'équitation de qualité supérieure
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <a
              href="/product-catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                backgroundColor: '#8B4513',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              🔍 Explorer le Catalogue
            </a>
            <a
              href="/temoignages"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              ⭐ Lire les Témoignages
            </a>
            <a
              href="/shopping-cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              🛒 Voir le Panier
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontSize: '2rem',
          color: 'rgba(255,255,255,0.8)',
          animation: 'bounce 2s infinite'
        }}>
          ↓
        </div>
      </section>

      {/* Section Bienvenue */}
      <section style={{
        padding: '5rem 1rem',
        backgroundColor: '#f8f6f3'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 'bold',
              color: '#2C1810',
              marginBottom: '1rem'
            }}>
              Bienvenue chez Roberto Equitazione
            </h2>
            <div style={{
              width: '4rem',
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
              Votre destination pour l'excellence équestre. Nous proposons une sélection soignée
              de selles et équipements d'équitation de la plus haute qualité.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                ⭐
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2C1810',
                marginBottom: '0.75rem'
              }}>
                Qualité Premium
              </h3>
              <p style={{
                color: '#6B5B4F'
              }}>
                Chaque produit est sélectionné pour sa qualité exceptionnelle et sa durabilité.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                🚚
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2C1810',
                marginBottom: '0.75rem'
              }}>
                Livraison Rapide
              </h3>
              <p style={{
                color: '#6B5B4F'
              }}>
                Expédition rapide et sécurisée pour que vous receviez vos produits en temps voulu.
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                💝
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2C1810',
                marginBottom: '0.75rem'
              }}>
                Passion Équestre
              </h3>
              <p style={{
                color: '#6B5B4F'
              }}>
                Une équipe passionnée qui comprend vos besoins et vous accompagne dans vos choix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section style={{
        padding: '5rem 1rem',
        backgroundColor: '#8B4513',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Prêt à découvrir notre collection ?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.95
          }}>
            Parcourez notre catalogue et trouvez l'équipement parfait pour vous et votre cheval.
          </p>
          <a
            href="/product-catalog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.25rem 2.5rem',
              backgroundColor: 'white',
              color: '#8B4513',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            → Commencer les Achats
          </a>
        </div>
      </section>
    </div>
  );
}
