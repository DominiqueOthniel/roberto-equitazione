/**
 * Utilitaires Supabase Storage pour réduire l'egress
 * - Signed URLs avec cache
 * - Thumbnails au lieu d'images complètes
 * - Cache local pour éviter les téléchargements répétés
 */

import { supabase, isSupabaseConfigured } from './supabase';

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
/**
 * Vérifie si une URL est déjà une URL publique Supabase
 */
function isPublicUrl(url) {
  return url && typeof url === 'string' && url.includes('/storage/v1/object/public/');
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  // Vérifier que le chemin est valide
  if (!path || path.trim() === '') {
    throw new Error('Chemin de fichier invalide');
  }

  if (!isSupabaseConfigured) {
    return path;
  }

  // Si le path est déjà une URL publique, la retourner directement
  if (isPublicUrl(path)) {
    return path;
  }

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
      // Gérer les erreurs 400 (Bad Request) et 404 (Not Found)
      if (error.statusCode === 400 || error.statusCode === 404 || 
          error.message?.includes('Object not found') || 
          error.message?.includes('not found') ||
          error.message?.includes('Bad Request')) {
        // Essayer d'utiliser l'URL publique à la place
        try {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
          return publicUrlData.publicUrl;
        } catch (publicUrlError) {
          throw new Error(`File not found: ${path}`);
        }
      }
      throw error;
    }

    // Mettre en cache
    signedUrlCache.set(cacheKey, data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    // Ne pas logger les erreurs "not found" ou "400" comme des erreurs critiques
    const isNotFoundError = error.message?.includes('not found') || 
                            error.message?.includes('Object not found') ||
                            error.message?.includes('File not found') ||
                            error.statusCode === 400 ||
                            error.statusCode === 404;
    
    if (!isNotFoundError) {
      console.error('Erreur getSignedUrl:', error);
    }
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
  } catch (error) {
    // Si la miniature n'existe pas, essayer l'image originale
    try {
      return await getSignedUrl(bucket, path);
    } catch (originalError) {
      // Si l'image originale n'existe pas non plus, relancer l'erreur
      throw originalError;
    }
  }
}

/**
 * Upload un fichier dans Supabase Storage
 * @param {string} bucket - Nom du bucket
 * @param {string} path - Chemin de destination
 * @param {File} file - Fichier à uploader
 * @param {Object} options - Options (createThumbnail, resize, etc.)
 * @returns {Promise<{path: string, url: string, thumbnailPath?: string}>}
 */
export async function uploadFile(bucket, path, file, options = {}) {
  try {
    console.log('📤 Upload fichier:', `bucket=${bucket}, path=${path}, fileName=${file.name}, size=${file.size}, type=${file.type}`);
    
    // Vérifier que le bucket existe (optionnel, mais utile pour le debug)
    // Ne pas bloquer si la vérification échoue (problème de permissions RLS)
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        // Ne pas logger comme erreur, juste un avertissement silencieux
        // C'est souvent un problème de permissions RLS qui n'empêche pas l'upload
      } else if (buckets) {
        const bucketExists = buckets.some(b => b.name === bucket);
        if (bucketExists) {
          console.log('✅ Bucket trouvé:', bucket);
        }
        // Ne pas throw si le bucket n'existe pas, l'upload peut quand même fonctionner
        // (le bucket peut exister mais ne pas être listable à cause des RLS)
      }
    } catch (checkError) {
      // Ignorer silencieusement les erreurs de vérification
      // L'upload sera tenté de toute façon
    }
    
    // Upload du fichier principal
    let uploadResult = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    let data = uploadResult.data;
    let error = uploadResult.error;

    if (error) {
      console.error('❌ Erreur upload Supabase:', error);
      console.error('❌ Détails:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Error uploading the image.';
      
      if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
        errorMessage = `The bucket "${bucket}" does not exist. Create it in Supabase Storage (Dashboard → Storage → New bucket).`;
      } else if (error.message?.includes('new row violates row-level security') || error.statusCode === 403) {
        errorMessage = 'Permission denied. Check the bucket RLS policies in Supabase. Run the supabase-storage-setup.sql script.';
      } else if (error.message?.includes('The resource already exists') || error.message?.includes('already exists')) {
        // Si le fichier existe déjà, essayer de le remplacer
        console.log('ℹ️ Le fichier existe déjà, tentative de remplacement...');
        const updateResult = await supabase.storage
          .from(bucket)
          .update(path, file, {
            cacheControl: '3600',
          });
        
        if (updateResult.error) {
          console.error('❌ Erreur lors du remplacement:', updateResult.error);
          errorMessage = `Error replacing the file: ${updateResult.error.message}`;
          throw new Error(errorMessage);
        }
        
        data = updateResult.data;
        error = null; // Réinitialiser l'erreur
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error'}`;
      }
      
      if (error) {
        throw new Error(errorMessage);
      }
    }

    console.log('✅ Fichier uploadé:', data.path);

    // Nettoyer le chemin : Supabase peut retourner le chemin avec ou sans préfixe
    let cleanPath = data.path;
    
    // Retirer tous les préfixes "products/" répétés
    while (cleanPath.startsWith('products/')) {
      cleanPath = cleanPath.substring('products/'.length);
    }
    
    // Si le chemin commence par le nom du bucket, le retirer aussi
    if (cleanPath.startsWith(`${bucket}/`)) {
      cleanPath = cleanPath.substring(bucket.length + 1);
    }

    console.log('🔧 Chemin nettoyé:', cleanPath, '| Chemin original:', data.path);

    // Récupérer l'URL publique avec le chemin nettoyé
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanPath);

    const publicUrl = urlData.publicUrl;
    console.log('✅ URL publique:', publicUrl);

    // Si on veut créer une miniature, il faudrait le faire côté serveur
    // Pour l'instant, on retourne juste le chemin et l'URL
    return {
      path: cleanPath,
      url: publicUrl,
    };
  } catch (error) {
    console.error('❌ Erreur uploadFile:', error);
    // Re-throw avec un message plus clair
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Error during upload: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Upload une image de produit
 * @param {File} file - Fichier image à uploader
 * @param {string} productName - Nom du produit (pour générer le nom de fichier)
 * @returns {Promise<string>} URL publique de l'image
 */
export async function uploadProductImage(file, productName = 'product') {
  try {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${sanitizedName}-${timestamp}.${fileExtension}`;
    // Ne pas préfixer avec "products/" car le bucket est déjà "products"
    const path = fileName;

    console.log('📤 Upload image produit:', `fileName=${fileName}, path=${path}, size=${file.size}`);

    const result = await uploadFile('products', path, file);
    
    console.log('✅ Image produit uploadée:', result.url);
    return result.url;
  } catch (error) {
    console.error('❌ Erreur uploadProductImage:', error);
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

/**
 * Supprime un fichier du storage
 * @param {string} bucket - Nom du bucket
 * @param {string} path - Chemin du fichier à supprimer
 * @returns {Promise<boolean>} True si supprimé avec succès
 */
export async function deleteFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }

    // Retirer du cache
    const cacheKey = `${bucket}/${path}`;
    if (typeof window !== 'undefined') {
      try {
        const cache = JSON.parse(localStorage.getItem(SIGNED_URL_CACHE_KEY) || '{}');
        delete cache[cacheKey];
        localStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(cache));
      } catch (cacheError) {
        console.warn('Erreur lors de la suppression du cache:', cacheError);
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur deleteFile:', error);
    throw error;
  }
}

/**
 * Liste tous les fichiers d'un bucket (récursif)
 * @param {string} bucket - Nom du bucket
 * @param {string} folder - Dossier à lister (optionnel, défaut: '')
 * @returns {Promise<Array<{name: string, id: string, updated_at: string, created_at: string, last_accessed_at: string, metadata: object}>>}
 */
export async function listFiles(bucket, folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      // Ne pas logger les erreurs 404 (dossier vide ou inexistant)
      if (error.statusCode === 404 || error.message?.includes('not found')) {
        return [];
      }
      console.error('Erreur lors de la liste des fichiers:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    let allFiles = [];
    const files = [];
    const folders = [];

    // Séparer les fichiers et les dossiers
    for (const item of data) {
      // Un dossier n'a généralement pas de métadonnées de taille ou a un id null
      // Un fichier a généralement des métadonnées avec une taille
      if (item.metadata && item.metadata.size !== undefined) {
        // C'est un fichier
        files.push(item);
      } else if (!item.name.includes('.')) {
        // Probablement un dossier (pas d'extension et pas de métadonnées de taille)
        folders.push(item);
      } else {
        // Fichier sans métadonnées, on l'ajoute quand même
        files.push(item);
      }
    }

    allFiles = [...files];

    // Récupérer récursivement les fichiers des sous-dossiers
    for (const folderItem of folders) {
      try {
        const subFolderPath = folder ? `${folder}/${folderItem.name}` : folderItem.name;
        const subFiles = await listFiles(bucket, subFolderPath);
        // Ajouter le chemin complet aux noms des fichiers
        const subFilesWithPath = subFiles.map(file => ({
          ...file,
          name: `${folderItem.name}/${file.name}`
        }));
        allFiles = [...allFiles, ...subFilesWithPath];
      } catch (subError) {
        // Ignorer les erreurs de sous-dossiers pour continuer avec les autres
        console.warn(`Erreur lors de la lecture du sous-dossier ${folderItem.name}:`, subError);
      }
    }

    return allFiles;
  } catch (error) {
    // Si c'est une erreur 400, retourner un tableau vide plutôt que de throw
    if (error.statusCode === 400 || error.message?.includes('Bad Request')) {
      console.warn('Erreur 400 lors de la liste des fichiers, retour d\'un tableau vide');
      return [];
    }
    console.error('Erreur listFiles:', error);
    throw error;
  }
}

/**
 * Obtient l'utilisation du storage d'un bucket
 * @param {string} bucket - Nom du bucket
 * @returns {Promise<{totalFiles: number, totalSize: number, sizeFormatted: string}>}
 */
export async function getStorageUsage(bucket) {
  try {
    const files = await listFiles(bucket);
    let totalSize = 0;

    // Calculer la taille totale (si disponible dans les métadonnées)
    files.forEach(file => {
      if (file.metadata?.size) {
        totalSize += file.metadata.size;
      }
    });

    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return {
      totalFiles: files.length,
      totalSize,
      sizeFormatted: formatSize(totalSize)
    };
  } catch (error) {
    console.error('Erreur getStorageUsage:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalFiles: 0,
      totalSize: 0,
      sizeFormatted: '0 B'
    };
  }
}

/**
 * Trouve les images orphelines (non utilisées dans les produits)
 * @param {string} bucket - Nom du bucket
 * @param {Array<string>} usedImageUrls - URLs d'images utilisées dans les produits
 * @returns {Promise<Array<{path: string, url: string, size: number}>>}
 */
export async function findOrphanImages(bucket, usedImageUrls = []) {
  try {
    // Récupérer toutes les images utilisées dans les produits
    let products = [];
    try {
      const productsModule = await import('@/utils/products-supabase');
      products = await productsModule.getProducts();
    } catch (importError) {
      console.warn('Impossible de charger les produits, utilisation des URLs fournies uniquement:', importError);
    }
    
    const usedUrls = new Set();
    products.forEach(product => {
      if (product.image) usedUrls.add(product.image);
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => usedUrls.add(img));
      }
    });
    
    // Ajouter les URLs fournies
    usedImageUrls.forEach(url => usedUrls.add(url));

    // Lister tous les fichiers du bucket
    let allFiles = [];
    try {
      allFiles = await listFiles(bucket);
    } catch (listError) {
      console.warn('Erreur lors de la liste des fichiers pour findOrphanImages:', listError);
      return []; // Retourner un tableau vide si on ne peut pas lister les fichiers
    }
    
    // Extraire les chemins des images utilisées
    const usedPaths = new Set();
    usedUrls.forEach(url => {
      if (url && typeof url === 'string') {
        if (url.includes('supabase.co/storage')) {
          // Format: https://xxx.supabase.co/storage/v1/object/public/products/path/to/image.jpg
          const pathMatch = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
          if (pathMatch) {
            usedPaths.add(pathMatch[1]);
          }
        } else if (url.startsWith('products/')) {
          // Format direct: products/path/to/image.jpg
          usedPaths.add(url.replace('products/', ''));
        }
      }
    });

    // Trouver les images orphelines
    const orphanImages = allFiles
      .filter(file => {
        const path = file.name;
        const isImage = path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.gif');
        return isImage && !usedPaths.has(path);
      })
      .map(file => {
        try {
          const { data } = supabase.storage.from(bucket).getPublicUrl(file.name);
          return {
            path: file.name,
            url: data.publicUrl,
            size: file.metadata?.size || 0,
            created_at: file.created_at
          };
        } catch (urlError) {
          console.warn(`Erreur lors de la génération de l'URL pour ${file.name}:`, urlError);
          return null;
        }
      })
      .filter(Boolean); // Retirer les null

    return orphanImages;
  } catch (error) {
    console.error('Erreur findOrphanImages:', error);
    // Retourner un tableau vide plutôt que de throw pour éviter de casser l'interface
    return [];
  }
}

/**
 * Supprime plusieurs fichiers en une fois
 * @param {string} bucket - Nom du bucket
 * @param {Array<string>} paths - Chemins des fichiers à supprimer
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function deleteMultipleFiles(bucket, paths) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error('Erreur lors de la suppression multiple:', error);
      throw error;
    }

    // Retirer du cache
    if (typeof window !== 'undefined') {
      try {
        const cache = JSON.parse(localStorage.getItem(SIGNED_URL_CACHE_KEY) || '{}');
        paths.forEach(path => {
          const cacheKey = `${bucket}/${path}`;
          delete cache[cacheKey];
        });
        localStorage.setItem(SIGNED_URL_CACHE_KEY, JSON.stringify(cache));
      } catch (cacheError) {
        console.warn('Erreur lors de la suppression du cache:', cacheError);
      }
    }

    return {
      success: data?.length || 0,
      failed: paths.length - (data?.length || 0)
    };
  } catch (error) {
    console.error('Erreur deleteMultipleFiles:', error);
    throw error;
  }
}


