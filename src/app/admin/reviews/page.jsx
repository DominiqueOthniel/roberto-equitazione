'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadReviews();
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      loadReviews();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadReviews = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const allReviewsData = JSON.parse(localStorage.getItem('productReviews') || '{}');
      let allReviews = [];
      
      // Convertir l'objet en tableau
      Object.keys(allReviewsData).forEach(productId => {
        const productReviews = allReviewsData[productId] || [];
        allReviews = allReviews.concat(productReviews);
      });
      
      // Trier par date (plus récent en premier)
      allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setReviews(allReviews);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setReviews([]);
    }
  };

  const updateReviewStatus = (reviewId, newStatus) => {
    if (typeof window === 'undefined') return;
    
    try {
      const allReviewsData = JSON.parse(localStorage.getItem('productReviews') || '{}');
      
      // Trouver et mettre à jour l'avis
      Object.keys(allReviewsData).forEach(productId => {
        const productReviews = allReviewsData[productId] || [];
        const reviewIndex = productReviews.findIndex(r => r.id === reviewId);
        if (reviewIndex !== -1) {
          productReviews[reviewIndex].status = newStatus;
          allReviewsData[productId] = productReviews;
        }
      });
      
      localStorage.setItem('productReviews', JSON.stringify(allReviewsData));
      loadReviews();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avis:', error);
    }
  };

  const deleteReview = (reviewId) => {
    if (!confirm('Sei sicuro di voler eliminare questa recensione?')) return;
    
    if (typeof window === 'undefined') return;
    
    try {
      const allReviewsData = JSON.parse(localStorage.getItem('productReviews') || '{}');
      
      // Trovare e eliminare la recensione
      Object.keys(allReviewsData).forEach(productId => {
        const productReviews = allReviewsData[productId] || [];
        const filteredReviews = productReviews.filter(r => r.id !== reviewId);
        allReviewsData[productId] = filteredReviews;
      });
      
      localStorage.setItem('productReviews', JSON.stringify(allReviewsData));
      loadReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
    }
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { total, pending, approved, rejected, averageRating };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
      const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
      const matchesSearch = 
        !searchQuery ||
        review.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.productId?.toString().includes(searchQuery);

      return matchesStatus && matchesRating && matchesSearch;
    });
  }, [reviews, filterStatus, filterRating, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'approved':
        return 'Approvato';
      case 'rejected':
        return 'Rifiutato';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-2">
                Gestione Recensioni
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Gestisci tutte le recensioni clienti ({filteredReviews.length} recensioni)
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Totale</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">In attesa</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Approvate</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-success">{stats.approved}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Rifiutate</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-error">{stats.rejected}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Voto medio</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca per autore, testo o ID prodotto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="approved">Approvato</option>
                <option value="rejected">Rifiutato</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              >
                <option value="all">Tutte le valutazioni</option>
                <option value="5">5 stelle</option>
                <option value="4">4 stelle</option>
                <option value="3">3 stelle</option>
                <option value="2">2 stelle</option>
                <option value="1">1 stella</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center text-text-secondary">
              Nessuna recensione trovata
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-card border border-border rounded-lg p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-heading font-bold">
                            {review.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-body font-semibold text-text-primary">{review.author}</p>
                          <p className="text-xs text-text-secondary">{formatDate(review.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(review.status)}`}>
                          {getStatusLabel(review.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-warning fill-warning'
                              : 'text-muted-foreground'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-text-secondary ml-1">{review.rating}/5</span>
                    </div>

                    <p className="text-text-secondary mb-3">{review.text}</p>

                    {review.image && (
                      <div className="relative w-32 h-32 bg-surface rounded-lg overflow-hidden mb-3">
                        <Image
                          src={review.image}
                          alt="Recensione"
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <span>Prodotto ID: {review.productId}</span>
                      <Link
                        href={`/product/${review.productId}`}
                        className="text-primary hover:underline"
                      >
                        Vedi il prodotto
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:w-48">
                    <select
                      value={review.status}
                      onChange={(e) => updateReviewStatus(review.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">In attesa</option>
                      <option value="approved">Approva</option>
                      <option value="rejected">Rifiuta</option>
                    </select>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="w-full bg-error text-error-foreground px-3 py-2 rounded-md font-body font-semibold hover:opacity-90 transition-fast text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

