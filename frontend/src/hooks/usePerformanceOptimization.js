import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Hook personnalisé pour optimiser les performances des composants
 * @param {Object} options - Options de configuration
 * @returns {Object} - Fonctions et valeurs optimisées
 */
export const usePerformanceOptimization = (options = {}) => {
  const {
    debounceDelay = 300,
    throttleDelay = 100,
    enableVirtualization = false,
    batchSize = 50
  } = options;

  // Ref pour stocker les timeouts
  const timeoutRef = useRef(null);
  const throttleRef = useRef(null);

  /**
   * Fonction debounced pour éviter les appels trop fréquents
   * @param {Function} callback - Fonction à exécuter
   * @param {Array} deps - Dépendances
   * @returns {Function} - Fonction debounced
   */
  const useDebouncedCallback = useCallback((callback, deps) => {
    return useCallback((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, debounceDelay);
    }, deps);
  }, [debounceDelay]);

  /**
   * Fonction throttled pour limiter la fréquence d'exécution
   * @param {Function} callback - Fonction à exécuter
   * @param {Array} deps - Dépendances
   * @returns {Function} - Fonction throttled
   */
  const useThrottledCallback = useCallback((callback, deps) => {
    return useCallback((...args) => {
      if (throttleRef.current) {
        return;
      }
      throttleRef.current = setTimeout(() => {
        callback(...args);
        throttleRef.current = null;
      }, throttleDelay);
    }, deps);
  }, [throttleDelay]);

  /**
   * Hook pour la virtualisation des listes
   * @param {Array} items - Liste des éléments
   * @param {number} itemHeight - Hauteur d'un élément
   * @param {number} containerHeight - Hauteur du conteneur
   * @returns {Object} - Données de virtualisation
   */
  const useVirtualization = useCallback((items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleItems = useMemo(() => {
      if (!enableVirtualization) return items;
      
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );
      
      return items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        index: startIndex + index,
        style: {
          position: 'absolute',
          top: (startIndex + index) * itemHeight,
          height: itemHeight,
          width: '100%'
        }
      }));
    }, [items, scrollTop, itemHeight, containerHeight, enableVirtualization]);

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      setScrollTop
    };
  }, [enableVirtualization]);

  /**
   * Hook pour le batching des mises à jour
   * @param {Function} updateFunction - Fonction de mise à jour
   * @returns {Function} - Fonction de mise à jour batchée
   */
  const useBatchedUpdates = useCallback((updateFunction) => {
    const batchRef = useRef([]);
    const timeoutRef = useRef(null);

    return useCallback((updates) => {
      batchRef.current.push(updates);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        updateFunction(batchRef.current);
        batchRef.current = [];
      }, 16); // 60fps
    }, [updateFunction]);
  }, []);

  /**
   * Hook pour la mémorisation intelligente
   * @param {Function} computeFunction - Fonction de calcul
   * @param {Array} deps - Dépendances
   * @param {Object} options - Options de mémorisation
   * @returns {any} - Valeur mémorisée
   */
  const useSmartMemo = useCallback((computeFunction, deps, options = {}) => {
    const { maxAge = 5000, enableCache = true } = options;
    const cacheRef = useRef(new Map());
    const lastUpdateRef = useRef(0);

    return useMemo(() => {
      if (!enableCache) {
        return computeFunction();
      }

      const now = Date.now();
      const cacheKey = JSON.stringify(deps);
      const cached = cacheRef.current.get(cacheKey);

      if (cached && (now - lastUpdateRef.current) < maxAge) {
        return cached.value;
      }

      const result = computeFunction();
      cacheRef.current.set(cacheKey, { value: result, timestamp: now });
      lastUpdateRef.current = now;

      return result;
    }, deps);
  }, []);

  /**
   * Hook pour la gestion des erreurs avec retry
   * @param {Function} asyncFunction - Fonction asynchrone
   * @param {Object} options - Options de retry
   * @returns {Object} - État et fonctions de gestion
   */
  const useAsyncWithRetry = useCallback((asyncFunction, options = {}) => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      onError = null
    } = options;

    const [state, setState] = useState({
      loading: false,
      error: null,
      data: null,
      retryCount: 0
    });

    const execute = useCallback(async (...args) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await asyncFunction(...args);
          setState({
            loading: false,
            error: null,
            data: result,
            retryCount: attempt
          });
          return result;
        } catch (error) {
          if (attempt === maxRetries) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message,
              retryCount: attempt
            }));
            if (onError) onError(error);
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }, [asyncFunction, maxRetries, retryDelay, onError]);

    const retry = useCallback(() => {
      if (state.data) {
        execute();
      }
    }, [execute, state.data]);

    return {
      ...state,
      execute,
      retry
    };
  }, []);

  // Cleanup des timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  return {
    useDebouncedCallback,
    useThrottledCallback,
    useVirtualization,
    useBatchedUpdates,
    useSmartMemo,
    useAsyncWithRetry
  };
};

export default usePerformanceOptimization;
