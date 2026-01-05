// useIsDarkMode.js
import { useState, useEffect } from 'react';

export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(
    // Initial check: if we are in a browser, check the class
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}