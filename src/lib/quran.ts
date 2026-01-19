export interface Verse {
    number: {
      inQuran: number;
      inSurah: number;
    };
    text: string;
    translation: string;
    tafseer?: string; // Optional detailed explanation
  }
  
  export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
    verses: Verse[];
  }
  
  const alFatihaVerses: Verse[] = [
    {
      number: { inQuran: 1, inSurah: 1 },
      text: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    },
    {
      number: { inQuran: 2, inSurah: 2 },
      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translation: '[All] praise is [due] to Allah, Lord of the worlds -',
    },
    {
      number: { inQuran: 3, inSurah: 3 },
      text: 'الرَّحْمَـٰنِ الرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful,',
    },
    {
      number: { inQuran: 4, inSurah: 4 },
      text: 'مَالِكِ يَوْمِ الدِّينِ',
      translation: 'Sovereign of the Day of Recompense.',
    },
    {
      number: { inQuran: 5, inSurah: 5 },
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'It is You we worship and You we ask for help.',
    },
    {
      number: { inQuran: 6, inSurah: 6 },
      text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      translation: 'Guide us to the straight path -',
    },
    {
      number: { inQuran: 7, inSurah: 7 },
      text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      translation: 'The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.',
    },
  ];
  
  
  export const surahs: Omit<Surah, 'verses'>[] = [
      { number: 1, name: 'سُورَةُ ٱلْفَاتِحَةِ', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opener', numberOfAyahs: 7, revelationType: 'Meccan' },
      { number: 2, name: 'سُورَةُ ٱلْبَقَرَةِ', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
      { number: 3, name: 'سُورَةُ آلِ عِمْرَانَ', englishName: 'Ali \'Imran', englishNameTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
      // ... up to 114
      { number: 112, name: 'سُورَةُ ٱلْإِخْلَاصِ', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan' },
      { number: 113, name: 'سُورَةُ ٱلْفَلَقِ', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan' },
      { number: 114, name: 'سُورَةُ ٱلنَّاسِ', englishName: 'An-Nas', englishNameTranslation: 'The Mankind', numberOfAyahs: 6, revelationType: 'Meccan' }
  ].map(s => ({...s, verses: s.number === 1 ? alFatihaVerses : Array.from({length: s.numberOfAyahs}, (_, i) => ({
      number: { inQuran: 0, inSurah: i + 1 },
      text: `(Verse ${i+1} text for ${s.englishName})`,
      translation: `(Verse ${i+1} translation)`
  }))}));
  
  
  export const getFullSurah = (surahNumber: number): Surah | undefined => {
      // In a real app, this would fetch from an API
      if (surahNumber === 1) {
          return surahs.find(s => s.number === surahNumber) as Surah;
      }
      return surahs.find(s => s.number === surahNumber) as Surah;
  }
  