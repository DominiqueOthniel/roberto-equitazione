'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getReviews, updateReviewStatus, deleteReview } from '@/utils/reviews-supabase';
import { getProducts } from '@/utils/products-supabase';

export default function AdminReviewsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'all';
  
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, [filterStatus]);

  const loadProducts = async () => {
    try {
      const productsList = await getProducts();
      const productsMap = {};
      productsList.forEach(product => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const reviewsData = await getReviews(filters);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      await loadReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Errore durante l\'aggiornamento dello stato');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Sei sicuro di voler eliminare questa recensione?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      await loadReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const stats = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const getProductName = (productId) => {
    return products[productId]?.name || 'Prodotto sconosciuto';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approvato';
      case 'rejected':
        return 'Rifiutato';
      case 'pending':
        return 'In attesa';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
          Recensioni
        </h2>
        <p className="text-text-secondary">
          Gestisci le recensioni dei prodotti
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Totale</p>
          <p className="text-2xl font-bold text-text-primary">{stats.all}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">In attesa</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Approvate</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Rifiutate</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-fast ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-text-primary hover:bg-muted/80'
            }`}
          >
            Tutte
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition-fast ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-muted text-text-primary hover:bg-muted/80'
            }`}
          >
            In attesa ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg transition-fast ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-muted text-text-primary hover:bg-muted/80'
            }`}
          >
            Approvate ({stats.approved})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg transition-fast ${
              filterStatus === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-muted text-text-primary hover:bg-muted/80'
            }`}
          >
            Rifiutate ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Caricamento...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Icon name="StarIcon" size={48} className="mx-auto text-text-secondary mb-4" variant="outline" />
          <p className="text-text-secondary">Nessuna recensione trovata</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-lg p-4 lg:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-text-primary mb-1">
                        {review.user_name || 'Anonimo'}
                      </h3>
                      <p className="text-sm text-text-secondary mb-2">
                        {getProductName(review.product_id)}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              name="StarIcon"
                              size={16}
                              className={star <= review.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}
                              variant={star <= review.rating ? 'solid' : 'outline'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-text-secondary">
                          {review.rating}/5
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(review.status)}`}>
                          {getStatusLabel(review.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-text-primary mb-3 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{review.user_email || 'N/A'}</span>
                    <span>•</span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-fast flex items-center justify-center gap-2"
                      >
                        <Icon name="CheckCircleIcon" size={16} variant="outline" />
                        Approva
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-fast flex items-center justify-center gap-2"
                      >
                        <Icon name="XMarkIcon" size={16} variant="outline" />
                        Rifiuta
                      </button>
                    </>
                  )}
                  {review.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'rejected')}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-fast flex items-center justify-center gap-2"
                    >
                      <Icon name="XMarkIcon" size={16} variant="outline" />
                      Rifiuta
                    </button>
                  )}
                  {review.status === 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'approved')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-fast flex items-center justify-center gap-2"
                    >
                      <Icon name="CheckCircleIcon" size={16} variant="outline" />
                      Approva
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="w-full px-4 py-2 bg-error text-error-foreground rounded-lg hover:opacity-90 transition-fast flex items-center justify-center gap-2"
                  >
                    <Icon name="TrashIcon" size={16} variant="outline" />
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

