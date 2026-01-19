'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Settings = {
  fontSize: number;
  prayerOffset: number;
};

type SettingsProviderState = {
  settings: Settings;
  setFontSize: (size: number) => void;
  setPrayerOffset: (offset: number) => void;
};

const defaultSettings: Settings = {
  fontSize: 16,
  prayerOffset: 0,
};

const SettingsProviderContext = createContext<SettingsProviderState>({
  settings: defaultSettings,
  setFontSize: () => null,
  setPrayerOffset: () => null,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('app-settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Could not load settings", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      document.body.style.fontSize = `${settings.fontSize}px`;
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

  const value = {
    settings,
    setFontSize,
    setPrayerOffset,
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
