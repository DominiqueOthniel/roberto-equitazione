/**
 * Composant Image optimisé pour réduire l'egress Supabase
 * - Utilise des thumbnails au lieu d'images complètes
 * - Cache les images localement
 * - Évite les téléchargements répétés
 * - Utilise des signed URLs pour les buckets privés
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getSignedUrl, getThumbnailUrl, getCachedImage, cacheImage } from '@/lib/supabase-storage';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  bucket = 'product-images', // Bucket Supabase par défaut
  useThumbnail = true, // Utiliser thumbnail par défaut
  thumbnailWidth = 300,
  thumbnailHeight = 300,
  fallbackSrc = '/assets/images/no_image.png',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSupabaseImage, setIsSupabaseImage] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    abortControllerRef.current = new AbortController();

    async function loadImage() {
      if (!src) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }

      // Vérifier si c'est une URL Supabase Storage
      const isSupabaseStorage = src.includes('supabase.co/storage') || src.startsWith('/storage/');
      
      // Si c'est une URL externe normale (Unsplash, etc.), utiliser directement
      if (!isSupabaseStorage && (src.startsWith('http://') || src.startsWith('https://'))) {
        // Vérifier le cache local d'abord
        const cached = await getCachedImage(src);
        if (cached) {
          if (mounted) {
            setImageSrc(cached);
            setIsLoading(false);
          }
          return;
        }

        // Si pas en cache, utiliser directement (mais on pourrait aussi le mettre en cache)
        if (mounted) {
          setImageSrc(src);
          setIsLoading(false);
        }
        return;
      }

      // Si c'est une image Supabase Storage
      if (isSupabaseStorage || src.startsWith('/')) {
        setIsSupabaseImage(true);
        
        try {
          // Extraire le chemin du bucket depuis l'URL
          let storagePath = src;
          if (src.includes('supabase.co/storage')) {
            // Extraire le chemin depuis l'URL complète
            const urlParts = src.split('/storage/v1/object/public/');
            if (urlParts.length > 1) {
              const pathParts = urlParts[1].split('/');
              storagePath = pathParts.slice(1).join('/');
            }
          } else if (src.startsWith('/')) {
            storagePath = src.substring(1);
          }

          // Vérifier le cache d'abord
          const cached = await getCachedImage(src);
          if (cached) {
            if (mounted) {
              setImageSrc(cached);
              setIsLoading(false);
            }
            return;
          }

          // Générer signed URL (avec thumbnail si demandé)
          let signedUrl;
          if (useThumbnail) {
            signedUrl = await getThumbnailUrl(bucket, storagePath, thumbnailWidth, thumbnailHeight);
          } else {
            signedUrl = await getSignedUrl(bucket, storagePath);
          }

          if (mounted && !abortControllerRef.current?.signal.aborted) {
            setImageSrc(signedUrl);
            setIsLoading(false);
            
            // Mettre en cache
            cacheImage(src, signedUrl);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'image Supabase:', error);
          if (mounted && !abortControllerRef.current?.signal.aborted) {
            setImageSrc(fallbackSrc);
            setHasError(true);
            setIsLoading(false);
          }
        }
      } else {
        // Image locale
        if (mounted) {
          setImageSrc(src);
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
      abortControllerRef.current?.abort();
    };
  }, [src, bucket, useThumbnail, thumbnailWidth, thumbnailHeight, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const commonClassName = `${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`;

  if (!imageSrc) {
    return (
      <div className={`${commonClassName} bg-muted flex items-center justify-center`} style={{ width, height }}>
        <span className="text-text-secondary text-sm">Chargement...</span>
      </div>
    );
  }

  const imageProps = {
    src: imageSrc,
    alt,
    className: commonClassName,
    priority,
    quality,
    onError: handleError,
    onLoad: handleLoad,
    unoptimized: isSupabaseImage, // Désactiver l'optimisation Next.js pour les images Supabase (déjà optimisées)
    ...props,
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          {...imageProps}
          fill
          sizes={sizes || '100vw'}
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
    />
  );
}


