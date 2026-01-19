
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Reciter } from '@/lib/reciters';
import { reciters as availableReciters } from '@/lib/reciters';


type Language = 'en' | 'ar';
type QuranViewMode = 'list' | 'page';
export type QuranEdition = 'uthmani' | 'tajweed' | 'warsh' | 'shubah';

type Settings = {
  fontSize: number;
  prayerOffset: number;
  language: Language;
  quranViewMode: QuranViewMode;
  quranEdition: QuranEdition;
  quranReciter: string;
};

type SettingsProviderState = {
  settings: Settings;
  setFontSize: (size: number) => void;
  setPrayerOffset: (offset: number) => void;
  setLanguage: (language: Language) => void;
  setQuranViewMode: (mode: QuranViewMode) => void;
  setQuranEdition: (edition: QuranEdition) => void;
  setQuranReciter: (reciter: string) => void;
  availableReciters: Reciter[];
};

const defaultSettings: Settings = {
  fontSize: 16,
  prayerOffset: 0,
  language: 'en',
  quranViewMode: 'list',
  quranEdition: 'uthmani',
  quranReciter: 'ar.mahermuaiqly',
};

const SettingsProviderContext = createContext<SettingsProviderState>({
  settings: defaultSettings,
  setFontSize: () => null,
  setPrayerOffset: () => null,
  setLanguage: () => null,
  setQuranViewMode: () => null,
  setQuranEdition: () => null,
  setQuranReciter: () => null,
  availableReciters: availableReciters,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('app-settings');
      if (storedSettings) {
        // Merge stored settings with defaults to avoid breaking changes
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({ ...defaultSettings, ...prev, ...parsedSettings }));
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
  
  const setQuranEdition = (edition: QuranEdition) => {
    setSettings(s => ({ ...s, quranEdition: edition }));
  };

  const setQuranReciter = (reciter: string) => {
    setSettings(s => ({...s, quranReciter: reciter}));
  }

  const value = {
    settings,
    setFontSize,
    setPrayerOffset,
    setLanguage,
    setQuranViewMode,
    setQuranEdition,
    setQuranReciter,
    availableReciters,
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
