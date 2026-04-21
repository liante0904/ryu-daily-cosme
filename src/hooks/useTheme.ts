import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    setIsDarkMode(!isDarkMode);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
  };

  return { isDarkMode, toggleTheme };
}
