'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerCustomer } from '@/utils/customers';
import { getWishlist, removeFromWishlist } from '@/utils/wishlist';

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Charger les données utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const userWithDefaults = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || userData.telefono || '',
          memberSince: userData.memberSince || new Date().toLocaleDateString('it-IT'),
          isVerified: userData.isVerified || false,
          ...userData
        };
        setUser(userWithDefaults);
        setLoading(false);
        
        // Enregistrer automatiquement le client dans l'admin
        registerCustomer(userWithDefaults);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        setLoading(false);
      }
    } else {
      // Si pas d'utilisateur connecté, rediriger vers la page de login
      if (typeof window !== 'undefined') {
        router.push('/login');
      }
    }
  }, [router]);

  // Charger la wishlist
  useEffect(() => {
    const loadWishlist = () => {
      const wishlist = getWishlist();
      setWishlistItems(wishlist);
    };

    loadWishlist();

    // Écouter les mises à jour de la wishlist
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, []);

  // Fonction pour supprimer un élément de la wishlist
  const handleRemoveFromWishlist = (itemId) => {
    const updatedWishlist = removeFromWishlist(itemId);
    setWishlistItems(updatedWishlist);
  };

  // Calculer les stats dynamiquement
  const stats = [
    {
      id: 1,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: (() => {
        // Compter les ordres en attente
        if (typeof window === 'undefined') return 0;
        try {
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          const userOrders = orders.filter(o => 
            o.email?.toLowerCase() === user?.email?.toLowerCase() && 
            ['pending', 'processing', 'shipped'].includes(o.status)
          );
          return userOrders.length;
        } catch {
          return 0;
        }
      })(),
      title: 'Ordini Attivi',
      description: 'Traccia i tuoi ordini in corso',
      color: 'brown'
    },
  ];

  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Initialiser les produits dans localStorage s'ils n'existent pas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeProducts = () => {
      const storedProducts = localStorage.getItem('products');
      if (!storedProducts) {
        const defaultProducts = [
          { id: 1, name: 'Sella Salto Leggera', brand: 'KIEFFER', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop', price: 2100, originalPrice: 2500, rating: 4.5, reviews: 29, type: 'Salto Ostacoli', size: '16.5', material: 'Pelle' },
          { id: 2, name: 'Sella Uso Generale Premium', brand: 'PRESTIGE', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', price: 3000, originalPrice: 3500, rating: 5, reviews: 45, type: 'Uso Generale', size: '17.5', material: 'Pelle' },
          { id: 3, name: 'Sella Dressage Comfort Plus', brand: 'PESSOA', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop', price: 2900, originalPrice: 3400, rating: 4.8, reviews: 38, type: 'Dressage', size: '17', material: 'Pelle' },
          { id: 4, name: 'Sella Dressage Elite Pro', brand: 'Prestige', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop', price: 3200, originalPrice: 3800, rating: 4.9, reviews: 47, type: 'Dressage', size: '17.5', material: 'Pelle' },
          { id: 5, name: 'Sella Salto Ostacoli Competition', brand: 'Pessoa', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop', price: 2800, originalPrice: 3200, rating: 4.6, reviews: 32, type: 'Salto Ostacoli', size: '17', material: 'Pelle' },
          { id: 6, name: 'Sella Uso Generale Comfort', brand: 'CWD', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', price: 2400, originalPrice: 2900, rating: 4.7, reviews: 56, type: 'Uso Generale', size: '18', material: 'Misto' },
          { id: 7, name: 'Sella Dressage Professional', brand: 'Butet', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop', price: 4500, originalPrice: 5200, rating: 4.9, reviews: 28, type: 'Dressage', size: '17.5', material: 'Pelle' },
          { id: 8, name: 'Sella Salto Performance', brand: 'Devoucoux', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop', price: 3600, originalPrice: 4100, rating: 4.8, reviews: 41, type: 'Salto Ostacoli', size: '16.5', material: 'Pelle' },
          { id: 9, name: 'Sella All Purpose Classic', brand: 'Passier', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', price: 2100, originalPrice: 2600, rating: 4.5, reviews: 39, type: 'Uso Generale', size: '17', material: 'Misto' },
          { id: 10, name: 'Sella Dressage Master', brand: 'Stubben', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop', price: 3800, originalPrice: 4400, rating: 4.9, reviews: 52, type: 'Dressage', size: '18', material: 'Pelle' }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
      }
    };

    initializeProducts();

    // Charger les commandes récentes
    const loadRecentOrders = () => {
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const userOrders = orders
          .filter(order => order.email?.toLowerCase() === user?.email?.toLowerCase())
          .sort((a, b) => {
            const dateA = new Date(a.orderDate || a.date);
            const dateB = new Date(b.orderDate || b.date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(order => {
            const orderDate = new Date(order.orderDate || order.date);
            const statusMap = {
              'pending': { label: 'In attesa', color: 'brown' },
              'processing': { label: 'In elaborazione', color: 'brown' },
              'shipped': { label: 'Spedito', color: 'brown' },
              'delivered': { label: 'Consegnato', color: 'green' },
              'cancelled': { label: 'Annullato', color: 'gray' }
            };
            const statusInfo = statusMap[order.status] || { label: order.status, color: 'brown' };
            
            return {
              id: order.id,
              date: orderDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              items: order.items?.length || 0,
              price: order.total || 0,
              status: statusInfo.label,
              statusColor: statusInfo.color
            };
          });
        setRecentOrders(userOrders);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setRecentOrders([]);
      }
    };

    // Charger les produits recommandés
    const loadRecommendedProducts = () => {
      try {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          const products = JSON.parse(storedProducts);
          // Sélectionner 10 produits (ou moins s'il n'y en a pas assez)
          // Prioriser les produits avec les meilleures notes et remises
          const recommended = products
            .sort((a, b) => {
              // Calculer un score de recommandation
              const scoreA = (a.rating || 0) * 2 + (a.originalPrice && a.price ? ((a.originalPrice - a.price) / a.originalPrice * 10) : 0);
              const scoreB = (b.rating || 0) * 2 + (b.originalPrice && b.price ? ((b.originalPrice - b.price) / b.originalPrice * 10) : 0);
              return scoreB - scoreA;
            })
            .slice(0, 10)
            .map(product => ({
              id: product.id,
              name: product.name,
              brand: product.brand,
              image: product.image,
              price: product.price,
              originalPrice: product.originalPrice,
              discount: product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null,
              rating: product.rating || 4.5
            }));
          setRecommendedProducts(recommended);
        } else {
          setRecommendedProducts([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setRecommendedProducts([]);
      }
    };

    if (user) {
      loadRecentOrders();
      loadRecommendedProducts();
    }

    // Écouter les nouveaux ordres
    const handleNewOrder = () => {
      if (user) {
        loadRecentOrders();
      }
    };

    window.addEventListener('newOrder', handleNewOrder);
    window.addEventListener('storage', handleNewOrder);

    return () => {
      window.removeEventListener('newOrder', handleNewOrder);
      window.removeEventListener('storage', handleNewOrder);
    };
  }, [user]);



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-center py-8">
              <p className="text-text-secondary">Caricamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-1">
                Benvenuto, {user.name || 'Utente'}!
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Membro dal {user.memberSince}
              </p>
            </div>
            {user.isVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-body font-semibold">Stato Account Verificato</span>
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`text-${stat.color === 'green' ? 'success' : 'primary'}`}>
                  {stat.icon}
                </div>
                <div className={`w-8 h-8 rounded-full bg-${stat.color === 'green' ? 'success' : 'primary'} text-primary-foreground flex items-center justify-center font-heading font-bold text-sm`}>
                  {stat.count}
                </div>
              </div>
              <h3 className="font-body font-bold text-text-primary mb-1">{stat.title}</h3>
              <p className="text-sm text-text-secondary">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Ordini Recenti */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                Ordini Recenti
              </h2>
              <Link href="/order-history" className="text-primary font-body hover:underline">
                Vedi tutti
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">Nessun ordine recente</p>
                  <Link href="/product-catalog" className="text-primary font-body hover:underline">
                    Inizia lo shopping
                  </Link>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order-history/${order.id}`}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-fast group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-body font-bold text-text-primary">{order.id}</p>
                        <div className={`flex items-center gap-1 ${
                          order.statusColor === 'green' ? 'text-success' : 'text-primary'
                        }`}>
                          {order.statusColor === 'green' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className="text-sm font-body">{order.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {order.date} • {order.items} {order.items === 1 ? 'articolo' : 'articoli'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-heading font-bold text-primary">
                        €{order.price.toLocaleString('it-IT')}
                      </p>
                      <svg className="w-5 h-5 text-text-secondary group-hover:text-primary transition-fast" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Consigliati per Te */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-text-primary mb-3 sm:mb-4">
              Consigliati per Te
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recommendedProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-text-secondary mb-4">Nessun prodotto disponibile</p>
                </div>
              ) : (
                recommendedProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-base">
                      <div className="relative aspect-square bg-surface">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-base"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {product.discount && (
                          <span className="absolute top-2 right-2 bg-error text-error-foreground px-2 py-1 rounded text-xs font-semibold">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-text-secondary uppercase font-semibold mb-1">{product.brand}</p>
                        <h3 className="font-body font-semibold text-text-primary text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-warning fill-warning" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-text-secondary">{product.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-text-primary">
                            €{product.price.toLocaleString('it-IT')}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-text-secondary line-through">
                              €{product.originalPrice.toLocaleString('it-IT')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

