/**
 * Utilitaires Supabase Storage pour réduire l'egress
 * - Signed URLs avec cache
 * - Thumbnails au lieu d'images complètes
 * - Cache local pour éviter les téléchargements répétés
 */

import { supabase } from './supabase';

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes
const SIGNED_URL_CACHE_KEY = 'supabase_signed_urls_cache';
const IMAGE_CACHE_KEY = 'supabase_images_cache';

/**
 * Cache pour les signed URLs (évite de régénérer les URLs)
 */
const signedUrlCache = {
  get: (path) => {
    if (typeof window === 'undefined') return null;
    try {
      const cache = JSON.parse(localStorage.getItem(SIGNED_URL_CACHE_KEY) || '{}');
      const cached = cache[path];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.url;
      }
      return null;
    } catch {
      return null;
    }
  },
  set: (path, url) => {
    if (typeof window === 'undefined') return;
    try {
      const cache = JSON.parse(localStorage.getItem(SIGNED_URL_CACHE_KEY) || '{}');
      cache[path] = {
        url,
        timestamp: Date.now(),
      };
      // Limiter la taille du cache (garder seulement les 100 dernières URLs)
      const entries = Object.entries(cache);
      if (entries.length > 100) {
        const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const newCache = Object.fromEntries(sorted.slice(0, 100));
        localStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(newCache));
      } else {
        localStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.warn('Erreur lors de la mise en cache des URLs:', error);
    }
  },
};

/**
 * Génère une signed URL pour un fichier dans Supabase Storage
 * @param {string} bucket - Nom du bucket
 * @param {string} path - Chemin du fichier
 * @param {number} expiresIn - Durée de validité en secondes (défaut: 3600 = 1h)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  // Vérifier le cache d'abord
  const cacheKey = `${bucket}/${path}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Erreur lors de la génération de la signed URL:', error);
      throw error;
    }

    // Mettre en cache
    signedUrlCache.set(cacheKey, data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    console.error('Erreur getSignedUrl:', error);
    throw error;
  }
}

/**
 * Génère une signed URL pour une miniature (thumbnail)
 * @param {string} bucket - Nom du bucket
 * @param {string} path - Chemin du fichier original
 * @param {number} width - Largeur de la miniature (défaut: 300)
 * @param {number} height - Hauteur de la miniature (défaut: 300)
 * @returns {Promise<string>} Signed URL de la miniature
 */
export async function getThumbnailUrl(bucket, path, width = 300, height = 300) {
  // Pour les thumbnails, on peut utiliser le chemin avec un suffixe
  // Exemple: "products/image.jpg" -> "products/thumbnails/image_300x300.jpg"
  const pathParts = path.split('/');
  const filename = pathParts.pop();
  const nameWithoutExt = filename.split('.')[0];
  const ext = filename.split('.').pop();
  const thumbnailPath = `${pathParts.join('/')}/thumbnails/${nameWithoutExt}_${width}x${height}.${ext}`;

  // Essayer d'abord la miniature
  try {
    return await getSignedUrl(bucket, thumbnailPath);
  } catch {
    // Si la miniature n'existe pas, retourner l'image originale (mais plus petite)
    // Note: Vous devrez créer les thumbnails lors de l'upload
    return await getSignedUrl(bucket, path);
  }
}

/**
 * Upload un fichier dans Supabase Storage
 * @param {string} bucket - Nom du bucket
 * @param {string} path - Chemin de destination
 * @param {File} file - Fichier à uploader
 * @param {Object} options - Options (createThumbnail, resize, etc.)
 * @returns {Promise<{path: string, thumbnailPath?: string}>}
 */
export async function uploadFile(bucket, path, file, options = {}) {
  try {
    // Upload du fichier principal
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Si on veut créer une miniature, il faudrait le faire côté serveur
    // Pour l'instant, on retourne juste le chemin
    return {
      path: data.path,
    };
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    throw error;
  }
}

/**
 * Vérifie si une image est déjà en cache local
 * @param {string} url - URL de l'image
 * @returns {Promise<string|null>} URL du cache ou null
 */
export async function getCachedImage(url) {
  if (typeof window === 'undefined') return null;

  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    const cached = cache[url];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Vérifier si l'image est toujours dans IndexedDB ou cache du navigateur
      return cached.url;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Met en cache une image
 * @param {string} originalUrl - URL originale
 * @param {string} cachedUrl - URL mise en cache (blob URL ou data URL)
 */
export function cacheImage(originalUrl, cachedUrl) {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    cache[originalUrl] = {
      url: cachedUrl,
      timestamp: Date.now(),
    };
    
    // Limiter la taille du cache
    const entries = Object.entries(cache);
    if (entries.length > 50) {
      const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const newCache = Object.fromEntries(sorted.slice(0, 50));
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(newCache));
    } else {
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.warn('Erreur lors de la mise en cache de l\'image:', error);
  }
}

/**
 * Nettoie les caches expirés
 */
export function cleanExpiredCache() {
  if (typeof window === 'undefined') return;
  
  try {
    // Nettoyer le cache des signed URLs
    const urlCache = JSON.parse(localStorage.getItem(SIGNED_URL_CACHE_KEY) || '{}');
    const now = Date.now();
    const cleanedUrlCache = Object.fromEntries(
      Object.entries(urlCache).filter(([_, value]) => now - value.timestamp < CACHE_DURATION)
    );
    localStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(cleanedUrlCache));

    // Nettoyer le cache des images
    const imageCache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    const cleanedImageCache = Object.fromEntries(
      Object.entries(imageCache).filter(([_, value]) => now - value.timestamp < CACHE_DURATION)
    );
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cleanedImageCache));
  } catch (error) {
    console.warn('Erreur lors du nettoyage du cache:', error);
  }
}

// Nettoyer le cache au chargement
if (typeof window !== 'undefined') {
  cleanExpiredCache();
}

