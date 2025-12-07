'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { addToCart } from '@/utils/cart-supabase';
import { getProductById } from '@/utils/products-supabase';
import ReviewForm from '@/components/product/ReviewForm';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('16.5');
  const [quantity, setQuantity] = useState(1);
  const [productReviews, setProductReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewsLoadedRef = useRef(false);

  // Charger le produit depuis Supabase
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await getProductById(productId);
        
        if (!productData) {
          console.error('Produit non trouvé:', productId);
          router.push('/product-catalog');
          return;
        }

        // Transformer les données Supabase au format attendu
        const formattedProduct = {
          id: productData.id,
          brand: productData.brand || '',
          name: productData.name || '',
          rating: productData.rating ? parseFloat(productData.rating) : 0,
          reviews: productData.reviews_count || 0,
          price: parseFloat(productData.price) || 0,
          originalPrice: productData.original_price ? parseFloat(productData.original_price) : null,
          discount: productData.original_price && productData.price 
            ? Math.round(((productData.original_price - productData.price) / productData.original_price) * 100)
            : null,
          images: productData.images && Array.isArray(productData.images) && productData.images.length > 0
            ? productData.images
            : productData.image
            ? [productData.image]
            : [],
          description: productData.description || '',
          disciplina: productData.type || '',
          paeseOrigine: productData.material || '',
          technicalSpecs: {
            misuraSedile: productData.size ? `${productData.size}"` : 'N/A',
            larghezzaArcione: 'Medium',
            lunghezzaQuartieri: 'Standard',
            materiale: productData.material || 'N/A'
          },
          features: productData.description 
            ? productData.description.split('.').filter(f => f.trim().length > 0).slice(0, 8)
            : [],
          sizes: productData.size ? [productData.size] : ['16.5', '17', '17.5']
        };

        setProduct(formattedProduct);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        router.push('/product-catalog');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

  // Charger les avis depuis localStorage (une seule fois)
  useEffect(() => {
    if (typeof window !== 'undefined' && !reviewsLoadedRef.current) {
      loadReviews();
      reviewsLoadedRef.current = true;
    }
  }, [productId]);

  const loadReviews = () => {
    try {
      const allReviewsData = JSON.parse(localStorage.getItem('productReviews') || '{}');
      const reviews = (allReviewsData[productId] || []).filter(r => r.status === 'approved');
      setProductReviews(reviews);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setProductReviews([]);
    }
  };

  const calculateReviewsData = () => {
    if (!productReviews || productReviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
      };
    }

    const total = productReviews.length;
    const average = productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    productReviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });

    // Formater les avis pour l'affichage
    const formattedReviews = productReviews.map(review => ({
      ...review,
      date: formatReviewDate(review.date),
      helpful: review.helpful || 0
    }));

    return {
      average: total > 0 ? Math.round(average * 10) / 10 : 0,
      total,
      distribution,
      reviews: formattedReviews
    };
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const reviewsData = calculateReviewsData();

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price: product.price,
        quantity: quantity,
        specs: {
          size: selectedSize
        }
      });
      
      alert('Prodotto aggiunto al carrello!');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const nextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const updateQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Early returns pour éviter les erreurs si product est null
  if (loading || !product) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Chargement du produit...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Produit non trouvé</p>
          <Link href="/product-catalog" className="text-primary hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 lg:px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <Link href="/product-catalog" className="hover:text-primary">Catalogo</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-surface rounded-lg overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <OptimizedImage
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  bucket="products"
                  useThumbnail={false}
                  quality={85}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <span>Aucune image</span>
                </div>
              )}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-fast"
                aria-label="Immagine precedente"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-fast"
                aria-label="Immagine successiva"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <>
                <div className="grid grid-cols-6 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square bg-surface rounded-lg overflow-hidden border-2 transition-fast ${
                        selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${product.name} - Immagine ${index + 1}`}
                        fill
                        className="object-cover"
                        bucket="products"
                        useThumbnail={true}
                        thumbnailWidth={150}
                        thumbnailHeight={150}
                        quality={70}
                        sizes="(max-width: 1024px) 16.66vw, 8vw"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-secondary text-center mt-2">
                  {selectedImageIndex + 1}/{product.images.length}
                </p>
              </>
            )}
          </div>

          {/* Right - Product Info */}
          <div>
            <p className="text-sm text-text-secondary uppercase font-semibold mb-2" translate="no">
              {product.brand}
            </p>
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  const isHalfStar = product.rating >= starValue - 0.5 && product.rating < starValue;
                  const isFullStar = product.rating >= starValue;
                  return (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        isFullStar || isHalfStar
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
              </div>
              <span className="font-body font-semibold text-text-primary">
                {product.rating} ({product.reviews} recensioni)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-heading font-bold text-text-primary">
                  €{product.price.toLocaleString('it-IT')}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-text-secondary line-through">
                    €{product.originalPrice.toLocaleString('it-IT')}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-error text-error-foreground px-3 py-1 rounded text-sm font-semibold">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-text-secondary mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Technical Specs */}
            <div className="mb-6 p-4 bg-surface rounded-lg">
              <h3 className="font-heading font-semibold text-text-primary mb-3">Specifiche Tecniche</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-text-secondary">Misura Sedile:</span>
                  <span className="font-semibold text-text-primary ml-2">{product.technicalSpecs.misuraSedile}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Larghezza Arcione:</span>
                  <span className="font-semibold text-text-primary ml-2">{product.technicalSpecs.larghezzaArcione}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Lunghezza Quartieri:</span>
                  <span className="font-semibold text-text-primary ml-2">{product.technicalSpecs.lunghezzaQuartieri}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Materiale:</span>
                  <span className="font-semibold text-text-primary ml-2">{product.technicalSpecs.materiale}</span>
                </div>
              </div>
            </div>

            {/* Discipline & Origin */}
            <div className="flex gap-4 mb-6 text-sm">
              <div>
                <span className="text-text-secondary">Disciplina:</span>
                <span className="font-semibold text-text-primary ml-2">{product.disciplina}</span>
              </div>
              <div>
                <span className="text-text-secondary">Paese di Origine:</span>
                <span className="font-semibold text-text-primary ml-2">{product.paeseOrigine}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-text-primary mb-3">Caratteristiche Principali</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Purchase Options Card */}
            <div className="bg-surface border border-border rounded-lg p-6">
              {/* Size Selector */}
              <div className="mb-4">
                <label className="block font-body font-semibold text-text-primary mb-3">
                  Misura Sedile
                </label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md font-body font-semibold transition-fast ${
                        selectedSize === size
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border text-text-primary hover:bg-muted'
                      }`}
                    >
                      {size}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block font-body font-semibold text-text-primary mb-3">
                  Quantità
                </label>
                <div className="flex items-center gap-3 border border-border rounded-md w-fit">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="p-2 hover:bg-muted transition-fast"
                    aria-label="Diminuisci quantità"
                  >
                    <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 font-body font-semibold text-text-primary min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="p-2 hover:bg-muted transition-fast"
                    aria-label="Aumenta quantità"
                  >
                    <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Aggiungi al Carrello
                </button>
                <button className="w-full bg-surface border-2 border-primary text-primary py-3 px-6 rounded-md font-body font-semibold hover:bg-muted transition-fast flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Acquista Ora
                </button>
              </div>

              {/* Shipping Info */}
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-body font-semibold text-text-primary">Spedizione Gratuita</p>
                    <p className="text-sm text-text-secondary">Per ordini superiori a €150</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-body font-semibold text-text-primary">Resi Gratuiti</p>
                    <p className="text-sm text-text-secondary">Entro 30 giorni dall'acquisto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-body font-semibold text-text-primary">Garanzia 2 Anni</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Recensioni
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showReviewForm ? 'Annulla' : 'Scrivi una recensione'}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm 
                productId={productId} 
                onReviewSubmitted={() => {
                  loadReviews();
                  setShowReviewForm(false);
                }}
              />
            </div>
          )}

          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center">
              <p className="text-5xl font-heading font-bold text-text-primary mb-2">
                {reviewsData.average}
              </p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  const isHalfStar = reviewsData.average >= starValue - 0.5 && reviewsData.average < starValue;
                  const isFullStar = reviewsData.average >= starValue;
                  return (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        isFullStar || isHalfStar
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
              </div>
              <p className="text-sm text-text-secondary">
                Basato su {reviewsData.total} {reviewsData.total === 1 ? 'recensione' : 'recensioni'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData.distribution[stars] || 0;
                const percentage = (count / reviewsData.total) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary w-16">
                      {stars} {stars === 1 ? 'stella' : 'stelle'}
                    </span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-secondary w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviewsData.reviews.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <p>Nessuna recensione per questo prodotto. Sii il primo a lasciare una recensione!</p>
              </div>
            ) : (
              reviewsData.reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-text-primary font-semibold">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-body font-semibold text-text-primary">{review.author}</p>
                        <p className="text-xs text-text-secondary">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-warning fill-warning'
                                : 'text-muted-foreground'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-text-secondary mb-3">{review.text}</p>
                    {review.image && (
                      <div className="relative w-24 h-24 bg-surface rounded-lg overflow-hidden mb-3">
                        <Image
                          src={review.image}
                          alt="Immagine recensione"
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    )}
                    <button className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-fast">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Utile ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

