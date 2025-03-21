
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface BaseContextProviderProps {
  children: React.ReactNode;
}

export function createBaseContext<T>(key: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  
  const saveToLocalStorage = (items: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };
  
  const loadFromLocalStorage = (): T[] => {
    try {
      const storedItems = localStorage.getItem(key);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return [];
    }
  };
  
  return {
    data,
    setData,
    loading,
    setLoading,
    saveToLocalStorage,
    loadFromLocalStorage
  };
}

// Theme management functionality that can be reused across contexts
export const useThemeManagement = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('system');

  const applyTheme = (mode: 'dark' | 'light' | 'system') => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      setDarkMode(prefersDark);
    } else {
      const isDark = mode === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      setDarkMode(isDark);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    applyTheme(themeMode);
  }, [themeMode]);

  const toggleDarkMode = () => {
    const newMode = themeMode === 'system' 
      ? (darkMode ? 'light' : 'dark')
      : (themeMode === 'dark' ? 'light' : 'dark');
    
    setThemeMode(newMode);
  };

  return {
    darkMode,
    themeMode,
    toggleDarkMode,
    setThemeMode,
    applyTheme
  };
};

// Online status management
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
