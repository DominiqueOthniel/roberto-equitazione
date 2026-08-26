/**
 * Product reviews utility functions with Supabase
 */

import { supabase } from '@/lib/supabase';

/**
 * Get all reviews
 */
export async function getReviews(filters = {}) {
  try {
    let query = supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_email) {
      query = query.eq('user_email', filters.user_email);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    throw error;
  }
}

/**
 * Get reviews by product ID
 */
export async function getReviewsByProduct(productId) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des avis du produit:', error);
    throw error;
  }
}

/**
 * Create a new review
 */
export async function createReview(reviewData) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: reviewData.product_id,
        user_id: reviewData.user_id || null,
        user_name: reviewData.user_name,
        user_email: reviewData.user_email || null,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: reviewData.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Update product rating and reviews count
    await updateProductReviewStats(reviewData.product_id);

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    throw error;
  }
}

/**
 * Update review status (approve/reject)
 */
export async function updateReviewStatus(reviewId, status) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ status })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Update product rating if status changed to approved/rejected
    if (data && data.product_id) {
      await updateProductReviewStats(data.product_id);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'avis:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId) {
  try {
    // Get product_id before deletion
    const { data: review } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Update product rating and reviews count
    if (review && review.product_id) {
      await updateProductReviewStats(review.product_id);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    throw error;
  }
}

/**
 * Update product rating and reviews count based on approved reviews
 */
async function updateProductReviewStats(productId) {
  try {
    // Get all approved reviews for this product
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (reviewsError) throw reviewsError;

    if (!reviews || reviews.length === 0) {
      // No approved reviews, reset rating and count
      const { error: updateError } = await supabase
        .from('products')
        .update({
          rating: 0,
          reviews_count: 0,
        })
        .eq('id', productId);

      if (updateError) throw updateError;
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2);
    const reviewsCount = reviews.length;

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: parseFloat(averageRating),
        reviews_count: reviewsCount,
      })
      .eq('id', productId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques du produit:', error);
    // Don't throw, just log the error
  }
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('status, rating');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0,
      averageRating: 0,
    };

    const approvedReviews = data?.filter(r => r.status === 'approved') || [];
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      stats.averageRating = (totalRating / approvedReviews.length).toFixed(2);
    }

    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des avis:', error);
    throw error;
  }
}

