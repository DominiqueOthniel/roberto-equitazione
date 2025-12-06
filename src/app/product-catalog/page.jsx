'use client';

import { useState, useMemo, useEffect } from 'react';
import FilterSidebar from '@/components/product/FilterSidebar';
import ProductCard from '@/components/product/ProductCard';
import { getProducts } from '@/utils/products-supabase';

export default function ProductCatalogPage() {
  {
    id: 1,
    name: 'Sella Salto Leggera',
    brand: 'KIEFFER',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 2100,
    originalPrice: 2500,
    rating: 3.5,
    reviews: 29,
    isNew: true,
    type: 'Salto Ostacoli',
    size: '16.5',
    material: 'Pelle'
  },
  {
    id: 2,
    name: 'Sella Uso Generale Premium',
    brand: 'PRESTIGE',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 3000,
    originalPrice: 3500,
    rating: 5,
    reviews: 45,
    isNew: false,
    type: 'Uso Generale',
    size: '17.5',
    material: 'Pelle'
  },
  {
    id: 3,
    name: 'Sella Dressage Comfort Plus',
    brand: 'PESSOA',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 2900,
    originalPrice: 3400,
    rating: 5,
    reviews: 38,
    isNew: true,
    type: 'Dressage',
    size: '17',
    material: 'Pelle'
  },
  {
    id: 4,
    name: 'Sella Dressage Elite Pro',
    brand: 'Prestige',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 3200,
    originalPrice: 3800,
    rating: 5,
    reviews: 47,
    isNew: false,
    type: 'Dressage',
    size: '17.5',
    material: 'Pelle'
  },
  {
    id: 5,
    name: 'Sella Salto Ostacoli Competition',
    brand: 'Pessoa',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 2800,
    originalPrice: 3200,
    rating: 4.5,
    reviews: 32,
    isNew: false,
    type: 'Salto Ostacoli',
    size: '17',
    material: 'Pelle'
  },
  {
    id: 6,
    name: 'Sella Uso Generale Comfort',
    brand: 'CWD',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 2400,
    originalPrice: 2900,
    rating: 5,
    reviews: 56,
    isNew: true,
    type: 'Uso Generale',
    size: '18',
    material: 'Misto'
  },
  {
    id: 7,
    name: 'Sella Dressage Professional',
    brand: 'Butet',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 4500,
    originalPrice: 5200,
    rating: 4.8,
    reviews: 28,
    isNew: false,
    type: 'Dressage',
    size: '17.5',
    material: 'Pelle'
  },
  {
    id: 8,
    name: 'Sella Salto Performance',
    brand: 'Devoucoux',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 3600,
    originalPrice: 4100,
    rating: 4.7,
    reviews: 41,
    isNew: false,
    type: 'Salto Ostacoli',
    size: '16.5',
    material: 'Pelle'
  },
  {
    id: 9,
    name: 'Sella All Purpose Classic',
    brand: 'Passier',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 2100,
    originalPrice: 2600,
    rating: 4.6,
    reviews: 39,
    isNew: true,
    type: 'Uso Generale',
    size: '17',
    material: 'Misto'
  },
  {
    id: 10,
    name: 'Sella Dressage Master',
    brand: 'Stubben',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 3800,
    originalPrice: 4400,
    rating: 4.9,
    reviews: 52,
    isNew: false,
    type: 'Dressage',
    size: '18',
    material: 'Pelle'
  },
  {
    id: 11,
    name: 'Sella Jumping Pro',
    brand: 'Pessoa',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 2900,
    originalPrice: 3400,
    rating: 4.5,
    reviews: 35,
    isNew: true,
    type: 'Salto Ostacoli',
    size: '18.5',
    material: 'Pelle'
  },
  {
    id: 12,
    name: 'Sella General Purpose Premium',
    brand: 'CWD',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 2700,
    originalPrice: 3200,
    rating: 4.8,
    reviews: 44,
    isNew: false,
    type: 'Uso Generale',
    size: '17.5',
    material: 'Pelle'
  },
  {
    id: 13,
    name: 'Sella Dressage Excellence',
    brand: 'Prestige',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 4100,
    originalPrice: 4800,
    rating: 5,
    reviews: 61,
    isNew: true,
    type: 'Dressage',
    size: '17',
    material: 'Pelle'
  },
  {
    id: 14,
    name: 'Sella Salto Champion',
    brand: 'Butet',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 3300,
    originalPrice: 3900,
    rating: 4.7,
    reviews: 38,
    isNew: false,
    type: 'Salto Ostacoli',
    size: '16',
    material: 'Pelle'
  },
  {
    id: 15,
    name: 'Sella All Round Deluxe',
    brand: 'Passier',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 2300,
    originalPrice: 2800,
    rating: 4.6,
    reviews: 42,
    isNew: true,
    type: 'Uso Generale',
    size: '18',
    material: 'Sintetico'
  },
  {
    id: 16,
    name: 'Sella Dressage Supreme',
    brand: 'Devoucoux',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop',
    price: 4900,
    originalPrice: 5600,
    rating: 4.9,
    reviews: 55,
    isNew: false,
    type: 'Dressage',
    size: '17.5',
    material: 'Pelle'
  },
  {
    id: 17,
    name: 'Sella Jumping Elite',
    brand: 'Stubben',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
    price: 3100,
    originalPrice: 3600,
    rating: 4.5,
    reviews: 33,
    isNew: true,
    type: 'Salto Ostacoli',
    size: '17',
    material: 'Pelle'
  },
  {
    id: 18,
    name: 'Sella General Purpose Standard',
    brand: 'Pessoa',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    price: 1900,
    originalPrice: 2400,
    rating: 4.4,
    reviews: 27,
    isNew: false,
    type: 'Uso Generale',
    size: '16.5',
    material: 'Misto'
  }
];

export default function ProductCatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    types: [],
    sizes: [],
    materials: []
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [displayedCount, setDisplayedCount] = useState(3);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const productsPerLoad = 3;

  // Charger les produits depuis Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        
        console.log('Produits chargés depuis Supabase:', productsData);
        
        // Transformer les données Supabase au format attendu
        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand || '',
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          price: parseFloat(product.price) || 0,
          originalPrice: product.original_price ? parseFloat(product.original_price) : null,
          rating: product.rating ? parseFloat(product.rating) : 0,
          reviews: product.reviews_count || 0,
          isNew: product.is_new || false,
          type: product.type || '',
          size: product.size || '',
          material: product.material || ''
        }));

        console.log('Produits formatés:', formattedProducts);

        setProducts(formattedProducts);
        console.log(`${formattedProducts.length} produits chargés depuis Supabase`);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        console.error('Détails de l\'erreur:', error.message, error.stack);
        setProducts([]); // Pas de fallback, tableau vide
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Réinitialiser displayedCount quand les filtres ou le tri changent
  useEffect(() => {
    setDisplayedCount(3);
  }, [filters, sortBy]);

  const filteredProducts = useMemo(() => {
    if (products.length === 0) return [];
    
    let filtered = products.filter(product => {
      // Filter by price
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Filter by type
      if (filters.types && filters.types.length > 0 && !filters.types.includes(product.type)) {
        return false;
      }
      
      // Filter by size
      if (filters.sizes && filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
        return false;
      }
      
      // Filter by material
      if (filters.materials && filters.materials.length > 0 && !filters.materials.includes(product.material)) {
        return false;
      }
      
      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Relevance (default order)
        break;
    }

    return filtered;
  }, [filters, sortBy]);

  // S'assurer que displayedCount ne dépasse pas le nombre de produits disponibles
  const actualDisplayedCount = Math.min(displayedCount, filteredProducts.length);
  const displayedProducts = filteredProducts.slice(0, actualDisplayedCount);
  const hasMore = actualDisplayedCount < filteredProducts.length;

  const handleLoadMore = () => {
    setDisplayedCount(prev => {
      const newCount = prev + productsPerLoad;
      return Math.min(newCount, filteredProducts.length);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-text-primary mb-3 tracking-tight">
            Catalogo Selle
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
            Scopri la nostra selezione di selle per equitazione delle migliori marche, accuratamente selezionate per offrirti qualità, comfort e prestazioni eccezionali.
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-4 lg:gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Mobile Filter Button and Overlay */}
          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-[110] lg:hidden"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border z-[120] overflow-y-auto lg:hidden">
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-text-primary">Filtri</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-muted rounded-md transition-fast"
                    aria-label="Chiudi filtri"
                  >
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <FilterSidebar filters={filters} onFilterChange={setFilters} />
                </div>
              </div>
            </>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort and Count Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-card text-text-primary hover:bg-muted transition-fast"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm font-body">Filtri</span>
                </button>
                <p className="text-xs sm:text-sm text-text-secondary">
                  {filteredProducts.length} prodotti trovati
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs sm:text-sm text-text-secondary whitespace-nowrap">Ordina per:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-1.5 border border-border rounded-md bg-background text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="relevance">Rilevanza</option>
                  <option value="price-asc">Prezzo: Basso a Alto</option>
                  <option value="price-desc">Prezzo: Alto a Basso</option>
                  <option value="rating">Valutazione</option>
                  <option value="reviews">Recensioni</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-text-secondary">Caricamento prodotti...</p>
                </div>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">Nessun prodotto trovato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center gap-2 text-sm sm:text-base"
                >
                  Carica Altri Prodotti
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
