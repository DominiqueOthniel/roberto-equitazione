/**
 * Hook personnalisé pour éviter les appels API infinis
 * - Gère le loading state
 * - Évite les appels multiples
 * - Nettoie les aborts
 */

import { useState, useEffect, useRef } from 'react';

export function useSupabaseQuery(queryFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    hasFetchedRef.current = false;

    async function fetchData() {
      // Éviter les appels multiples
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const result = await queryFn(abortControllerRef.current.signal);

        if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
          // Ignorer les erreurs d'abort
          if (err.name !== 'AbortError') {
            setError(err);
            setLoading(false);
          }
        }
      }
    }

    fetchData();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return { data, loading, error };
}

/**
 * Hook pour les requêtes Supabase avec debounce
 */
export function useSupabaseQueryDebounced(queryFn, dependencies = [], delay = 300) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const result = await queryFn(abortControllerRef.current.signal);

        if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
          if (err.name !== 'AbortError') {
            setError(err);
            setLoading(false);
          }
        }
      }
    }, delay);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return { data, loading, error };
}


