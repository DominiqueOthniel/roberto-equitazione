'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { addToCart } from '@/utils/cart-supabase';

export default function ProductCard({ product }) {
  const {
    id,
    name,
    brand,
    image,
    price,
    originalPrice,
    rating,
    reviews,
    isNew,
    type,
    size
  } = product;

  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return; // Éviter les doubles clics
    
    setIsAdding(true);
    
    try {
      console.log('🛒 [ProductCard] Ajout du produit au panier:', name);
      console.log('🛒 [ProductCard] Données produit:', { id, name, brand, price });
      
      const result = await addToCart({
        id,
        name,
        brand,
        image,
        price,
        quantity: 1,
        specs: {
          type: type || '',
          size: size || ''
        }
      });
      
      console.log('✅ [ProductCard] Produit ajouté avec succès, panier:', result);
      
      // Vérifier que le panier est bien dans localStorage
      if (typeof window !== 'undefined') {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          console.log('✅ [ProductCard] Panier vérifié dans localStorage, items:', parsedCart.length);
        } else {
          console.error('❌ [ProductCard] Panier NON trouvé dans localStorage après ajout !');
        }
      }
      
      // Feedback visuel immédiat
      alert(`✅ ${name} aggiunto al carrello!`);
      
    } catch (error) {
      console.error('❌ [ProductCard] Erreur lors de l\'ajout au panier:', error);
      console.error('❌ [ProductCard] Stack:', error.stack);
      alert(`❌ Erreur: ${error.message || 'Impossible d\'ajouter au panier'}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-base">
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-square bg-surface overflow-hidden">
          {image ? (
            <OptimizedImage
              src={image}
              alt={name}
              fill
              className="object-cover hover:scale-105 transition-base"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              bucket="products"
              useThumbnail={true}
              thumbnailWidth={400}
              thumbnailHeight={400}
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-text-secondary">No Image</span>
            </div>
          )}
          
          {isNew && (
            <span className="absolute top-2 left-2 bg-warning text-warning-foreground px-2 py-1 rounded text-xs font-semibold">
              Nuovo
            </span>
          )}
        </div>
      </Link>
        
      <div className="p-3 sm:p-4">
        <p className="text-xs text-text-secondary mb-1 uppercase font-semibold" translate="no">{brand}</p>
        <Link href={`/product/${id}`}>
          <h3 className="font-body font-semibold text-sm sm:text-base text-text-primary mb-2 line-clamp-2 hover:text-primary transition-fast">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const isHalfStar = rating >= starValue - 0.5 && rating < starValue;
            const isFullStar = rating >= starValue;
            
            return (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  isFullStar
                    ? 'text-warning fill-warning'
                    : isHalfStar
                    ? 'text-warning fill-warning'
                    : 'text-muted-foreground'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          })}
          <span className="text-xs text-text-secondary ml-1">
            ({reviews})
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-base sm:text-lg font-heading font-bold text-text-primary">
            €{price.toLocaleString('it-IT')}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs sm:text-sm text-text-secondary line-through">
              €{originalPrice.toLocaleString('it-IT')}
            </span>
          )}
        </div>

        <p className="text-xs text-text-secondary mb-2 sm:mb-3">
          {type} {size}"
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-primary text-primary-foreground py-2 px-3 sm:px-4 rounded-md font-body font-semibold hover:opacity-90 transition-fast text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aggiunta...
            </>
          ) : (
            'Aggiungi al Carrello'
          )}
        </button>
      </div>
    </div>
  );
}

