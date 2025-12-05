'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { addToCart } from '@/utils/cart';

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart({
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
      
      console.log('Produit ajouté au panier:', name);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
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
              bucket="product-images"
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
          className="w-full bg-primary text-primary-foreground py-2 px-3 sm:px-4 rounded-md font-body font-semibold hover:opacity-90 transition-fast text-sm sm:text-base"
        >
          Aggiungi al Carrello
        </button>
      </div>
    </div>
  );
}

