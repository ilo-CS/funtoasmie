import { useState, useEffect, useCallback } from 'react';

export const useAnimation = (delay = 100) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const triggerAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return { isVisible, triggerAnimation };
};

// Hook pour les animations de focus
export const useFocusAnimation = () => {
  const [focusedField, setFocusedField] = useState(null);

  const handleFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const isFocused = useCallback((fieldName) => {
    return focusedField === fieldName;
  }, [focusedField]);

  return { focusedField, handleFocus, handleBlur, isFocused };
};
