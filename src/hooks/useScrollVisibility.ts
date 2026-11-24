import { useEffect, useRef, useState } from 'react';

/**
 * Track whether the viewport is near the bottom and whether floating controls should be shown.
 */
export function useScrollVisibility() {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showFloating, setShowFloating] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);

      if (scrollTop < 10) {
        setShowFloating(true);
      } else if (scrollTop > lastScrollYRef.current) {
        setShowFloating(false);
      } else if (scrollTop < lastScrollYRef.current - 5) {
        setShowFloating(true);
      }

      lastScrollYRef.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isAtBottom, showFloating };
}
