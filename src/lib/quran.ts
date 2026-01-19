
export interface Word {
  text: string;
  tajweed: {
    rule: string;
    color: string;
  } | null;
}

export interface Verse {
  number: {
    inQuran: number;
    inSurah: number;
  };
  text: string;
  translation: string;
  tafseer?: string;
  words?: Word[];
}

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Surah extends SurahInfo {
  verses: Verse[];
}

// The surah list is now fetched dynamically from the Al Quran Cloud API.
