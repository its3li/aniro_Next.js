
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Reciter } from '@/lib/reciters';
import { reciters as availableReciters } from '@/lib/reciters';


type Language = 'en' | 'ar';
type QuranViewMode = 'list' | 'page';
export type QuranEdition = 'uthmani' | 'tajweed' | 'warsh' | 'shubah';

import { CalculationMethodName, DSTMode } from '@/lib/prayer';

export type TimeFormat = '12h' | '24h';

type Settings = {
  fontSize: number;
  prayerOffset: number;
  dstMode: DSTMode;
  language: Language;
  quranViewMode: QuranViewMode;
  quranEdition: QuranEdition;
  quranReciter: string;
  calculationMethod: CalculationMethodName;
  timeFormat: TimeFormat;
  widgetTheme: 'default' | 'system' | 'custom';
  widgetBackgroundColor: string;
  appTheme: 'system' | 'light' | 'dark';
};

type SettingsProviderState = {
  settings: Settings;
  setFontSize: (size: number) => void;
  setPrayerOffset: (offset: number) => void;
  setLanguage: (language: Language) => void;
  setQuranViewMode: (mode: QuranViewMode) => void;
  setQuranEdition: (edition: QuranEdition) => void;
  setQuranReciter: (reciter: string) => void;
  setCalculationMethod: (method: CalculationMethodName) => void;
  setDstMode: (mode: DSTMode) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setWidgetTheme: (theme: 'default' | 'system' | 'custom') => void;
  setWidgetBackgroundColor: (color: string) => void;
  setAppTheme: (theme: 'system' | 'light' | 'dark') => void;
  availableReciters: Reciter[];
};

const defaultSettings: Settings = {
  fontSize: 16,
  prayerOffset: 0,
  language: 'ar',
  quranViewMode: 'list',
  quranEdition: 'uthmani',
  quranReciter: 'ar.mahermuaiqly',
  calculationMethod: 'muslim_world_league',
  dstMode: 'auto',
  timeFormat: '12h',
  widgetTheme: 'default',
  widgetBackgroundColor: '#24252B',
  appTheme: 'system',
};

const SettingsProviderContext = createContext<SettingsProviderState>({
  settings: defaultSettings,
  setFontSize: () => null,
  setPrayerOffset: () => null,
  setLanguage: () => null,
  setQuranViewMode: () => null,
  setQuranEdition: () => null,
  setQuranReciter: () => null,
  setCalculationMethod: () => null,
  setDstMode: () => null,
  setTimeFormat: () => null,
  setWidgetTheme: () => null,
  setWidgetBackgroundColor: () => null,
  setAppTheme: () => null,
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
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
      document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = settings.language;

      const applyTheme = () => {
        const isDark =
          settings.appTheme === 'dark' ||
          (settings.appTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      applyTheme();

      // Listen for system changes if in system mode
      if (settings.appTheme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }

    } catch (error) {
      console.error("Could not save settings", error);
    }
  }, [settings]);

  // Sync with Native Widget
  useEffect(() => {
    const syncWidget = async () => {
      try {
        // @ts-ignore
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.WidgetData) {
          // @ts-ignore
          await window.Capacitor.Plugins.WidgetData.updateData({
            latitude: 21.4225, // TODO: Get real location if available in settings or separate hook
            longitude: 39.8262,
            calculationMethod: settings.calculationMethod,
            prayerOffset: settings.prayerOffset,
            dstMode: settings.dstMode,
            widgetBackgroundColor: settings.widgetTheme === 'default' ? '#24252B' : settings.widgetBackgroundColor,
            useSystemWidgetColor: settings.widgetTheme === 'system',
            language: settings.language
          });
        }
      } catch (e) {
        console.error("Failed to sync widget data", e);
      }
    };
    syncWidget();
  }, [settings.calculationMethod, settings.prayerOffset, settings.dstMode, settings.widgetBackgroundColor, settings.widgetTheme, settings.language]);

  const setFontSize = (size: number) => {
    setSettings(s => ({ ...s, fontSize: size }));
  };

  const setPrayerOffset = (offset: number) => {
    setSettings(s => ({ ...s, prayerOffset: offset }));
  };

  const setLanguage = (language: Language) => {
    setSettings(s => ({ ...s, language }));
  };

  const setQuranViewMode = (mode: QuranViewMode) => {
    setSettings(s => ({ ...s, quranViewMode: mode }));
  };

  const setQuranEdition = (edition: QuranEdition) => {
    setSettings(s => ({ ...s, quranEdition: edition }));
  };

  const setAppTheme = (theme: 'system' | 'light' | 'dark') => {
    setSettings(s => ({ ...s, appTheme: theme }));
  };

  const setQuranReciter = (reciter: string) => {
    setSettings(s => ({ ...s, quranReciter: reciter }));
  }

  const setCalculationMethod = (method: CalculationMethodName) => {
    setSettings(s => ({ ...s, calculationMethod: method }));
  }

  const setDstMode = (mode: DSTMode) => {
    setSettings(s => ({ ...s, dstMode: mode }));
  }

  const setTimeFormat = (format: TimeFormat) => {
    setSettings(s => ({ ...s, timeFormat: format }));
  }

  const setWidgetTheme = (theme: 'default' | 'system' | 'custom') => {
    setSettings(s => ({ ...s, widgetTheme: theme }));
  }

  const setWidgetBackgroundColor = (color: string) => {
    setSettings(s => ({ ...s, widgetBackgroundColor: color }));
  }

  const value = {
    settings,
    setFontSize,
    setPrayerOffset,
    setLanguage,
    setQuranViewMode,
    setQuranEdition,
    setQuranReciter,
    setCalculationMethod,
    setDstMode,
    setTimeFormat,
    setWidgetTheme,
    setWidgetBackgroundColor,
    setAppTheme,
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
