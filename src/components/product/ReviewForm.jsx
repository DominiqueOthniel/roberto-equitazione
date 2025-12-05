'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Charger le nom de l'utilisateur connecté depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.name) {
          setAuthorName(userData.name);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nom utilisateur:', error);
      }
    }
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'immagine non deve superare i 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating) {
      setError('Per favore, seleziona una valutazione');
      return;
    }

    if (!reviewText.trim()) {
      setError('Per favore, scrivi una recensione');
      return;
    }

    if (!authorName.trim()) {
      setError('Per favore, inserisci il tuo nome');
      return;
    }

    setIsSubmitting(true);

    try {
      // Récupérer les avis existants
      const existingReviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
      const productReviews = existingReviews[productId] || [];

      // Créer le nouvel avis
      const newReview = {
        id: Date.now(),
        productId: productId,
        author: authorName.trim(),
        rating: rating,
        text: reviewText.trim(),
        image: imagePreview || null,
        date: new Date().toISOString(),
        helpful: 0,
        status: 'pending' // En attente de modération
      };

      // Ajouter l'avis
      productReviews.push(newReview);
      existingReviews[productId] = productReviews;
      localStorage.setItem('productReviews', JSON.stringify(existingReviews));

      // Réinitialiser le formulaire
      setRating(0);
      setReviewText('');
      setAuthorName('');
      setSelectedImage(null);
      setImagePreview(null);

      // Notifier le parent
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      alert('La tua recensione è stata inviata e sarà pubblicata dopo la moderazione. Grazie!');
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <h3 className="text-xl font-heading font-bold text-text-primary mb-4">
        Scrivi una recensione
      </h3>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-md p-3 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label htmlFor="authorName" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Il tuo nome <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Il tuo nome"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-body font-semibold text-text-primary mb-2">
            Valutazione <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-fast ${
                    star <= (hoveredRating || rating)
                      ? 'text-warning fill-warning'
                      : 'text-muted-foreground'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-text-secondary ml-2">
                {rating === 1 ? '1 stella' : `${rating} stelle`}
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-body font-semibold text-text-primary mb-2">
            La tua recensione <span className="text-error">*</span>
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Condividi la tua esperienza con questo prodotto..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-body font-semibold text-text-primary mb-2">
            Foto (opzionale)
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              <div className="relative w-32 h-32 bg-surface rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Anteprima"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-error text-error-foreground rounded-full p-1 hover:opacity-90 transition-fast"
                aria-label="Rimuovi l'immagine"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-background hover:bg-muted transition-fast cursor-pointer">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-text-primary">Aggiungi una foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
          <p className="text-xs text-text-secondary mt-1">Max 5MB, formati: JPG, PNG</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-body font-semibold hover:opacity-90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Invio in corso...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Pubblica la recensione</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

