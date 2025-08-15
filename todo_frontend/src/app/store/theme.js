'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  themeMode: 'light',
  setLightTheme: () => { },
  setDarkTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  const setLightTheme = () => setThemeMode('light');
  const setDarkTheme = () => setThemeMode('dark');

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(themeMode);
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark' || (!stored && prefersDark)) {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }


  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);