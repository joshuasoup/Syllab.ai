import { useState, useEffect } from 'react';

// Create a global state for the theme
let globalIsDarkMode = (() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
})();

// Create a list of subscribers
const subscribers = new Set<() => void>();

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(globalIsDarkMode);

  useEffect(() => {
    // Add this component to subscribers
    const updateState = () => setIsDarkMode(globalIsDarkMode);
    subscribers.add(updateState);

    // Cleanup
    return () => {
      subscribers.delete(updateState);
    };
  }, []);

  const toggleTheme = () => {
    globalIsDarkMode = !globalIsDarkMode;
    // Update localStorage
    localStorage.setItem('theme', globalIsDarkMode ? 'dark' : 'light');
    
    // Update document class
    if (globalIsDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Notify all subscribers
    subscribers.forEach(update => update());
  };

  return {
    isDarkMode,
    toggleTheme,
  };
} 
