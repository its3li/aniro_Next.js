
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';
type QuranViewMode = 'list' | 'page';

type Settings = {
  fontSize: number;
  prayerOffset: number;
  language: Language;
  quranViewMode: QuranViewMode;
};

type SettingsProviderState = {
  settings: Settings;
  setFontSize: (size: number) => void;
  setPrayerOffset: (offset: number) => void;
  setLanguage: (language: Language) => void;
  setQuranViewMode: (mode: QuranViewMode) => void;
};

const defaultSettings: Settings = {
  fontSize: 16,
  prayerOffset: 0,
  language: 'en',
  quranViewMode: 'list',
};

const SettingsProviderContext = createContext<SettingsProviderState>({
  settings: defaultSettings,
  setFontSize: () => null,
  setPrayerOffset: () => null,
  setLanguage: () => null,
  setQuranViewMode: () => null,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('app-settings');
      if (storedSettings) {
        // Merge stored settings with defaults to avoid breaking changes
        setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
      }
    } catch (error) {
      console.error("Could not load settings", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      document.body.style.fontSize = `${settings.fontSize}px`;
      document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = settings.language;
    } catch (error) {
      console.error("Could not save settings", error);
    }
  }, [settings]);

  const setFontSize = (size: number) => {
    setSettings(s => ({ ...s, fontSize: size }));
  };
  
  const setPrayerOffset = (offset: number) => {
    setSettings(s => ({ ...s, prayerOffset: offset }));
  };

  const setLanguage = (language: Language) => {
    setSettings(s => ({...s, language }));
  };

  const setQuranViewMode = (mode: QuranViewMode) => {
    setSettings(s => ({ ...s, quranViewMode: mode }));
  };

  const value = {
    settings,
    setFontSize,
    setPrayerOffset,
    setLanguage,
    setQuranViewMode,
  };

  return (
    <SettingsProviderContext.Provider value={value}>
      {children}
    </SettingsProviderContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
