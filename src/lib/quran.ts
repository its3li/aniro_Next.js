
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

// ============================================
// OFFLINE-FIRST DATA FETCHING
// ============================================

import { get, set } from 'idb-keyval';

const SURAH_DATA_PREFIX = 'surah_';
const SURAH_LIST_KEY = 'surah_list';
const SURAH_API_BASE = 'https://api.alquran.cloud/v1/surah';

/**
 * Get a Surah with Offline-First strategy.
 * 
 * 1. Check IndexedDB first (instant if cached)
 * 2. If not found, fetch from API
 * 3. Cache the result for next time
 * 
 * @param surahId - The Surah number (1-114)
 * @param edition - The edition to fetch (uthmani, tajweed, etc.)
 * @returns The Surah data or null if unavailable
 */
export async function getSurah(
  surahId: number,
  edition: string = 'quran-uthmani'
): Promise<Surah | null> {
  const cacheKey = `${SURAH_DATA_PREFIX}${surahId}_${edition}`;

  try {
    // Step 1: Check IndexedDB cache first (instant)
    const cachedData = await get(cacheKey);
    if (cachedData) {
      console.log(`[Quran] Cache HIT for Surah ${surahId} (${edition})`);
      return cachedData as Surah;
    }

    console.log(`[Quran] Cache MISS for Surah ${surahId} (${edition}), fetching from API...`);

    // Step 2: Fetch from API
    const response = await fetch(`${SURAH_API_BASE}/${surahId}/${edition}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.code !== 200 || !json.data) {
      throw new Error('Invalid API response');
    }

    // Transform API response to our Surah interface
    const apiData = json.data;
    const surah: Surah = {
      number: apiData.number,
      name: apiData.name,
      englishName: apiData.englishName,
      englishNameTranslation: apiData.englishNameTranslation,
      numberOfAyahs: apiData.numberOfAyahs,
      revelationType: apiData.revelationType,
      verses: apiData.ayahs.map((ayah: any) => ({
        number: {
          inQuran: ayah.number,
          inSurah: ayah.numberInSurah,
        },
        text: ayah.text,
        translation: '', // Will be fetched separately if needed
      })),
    };

    // Step 3: Cache the result for next time
    await set(cacheKey, surah);
    console.log(`[Quran] Cached Surah ${surahId} (${edition}) to IndexedDB`);

    return surah;
  } catch (error) {
    console.error(`[Quran] Failed to get Surah ${surahId}:`, error);

    // Try to return basic cached version without edition suffix
    const basicCacheKey = `${SURAH_DATA_PREFIX}${surahId}`;
    const basicCached = await get(basicCacheKey);
    if (basicCached) {
      console.log(`[Quran] Returning basic cached version of Surah ${surahId}`);
      return basicCached as Surah;
    }

    return null;
  }
}

/**
 * Get Surah with translation - fetches both Arabic text and translation.
 * 
 * @param surahId - The Surah number (1-114)
 * @param arabicEdition - Arabic text edition
 * @param translationEdition - Translation edition
 */
export async function getSurahWithTranslation(
  surahId: number,
  arabicEdition: string = 'quran-uthmani',
  translationEdition: string = 'en.asad'
): Promise<Surah | null> {
  const cacheKey = `${SURAH_DATA_PREFIX}${surahId}_${arabicEdition}_${translationEdition}`;

  try {
    // Check cache first
    const cachedData = await get(cacheKey);
    if (cachedData) {
      console.log(`[Quran] Cache HIT for Surah ${surahId} with translation`);
      return cachedData as Surah;
    }

    console.log(`[Quran] Fetching Surah ${surahId} with translation...`);

    // Fetch both editions in parallel
    const [arabicResponse, translationResponse] = await Promise.all([
      fetch(`${SURAH_API_BASE}/${surahId}/${arabicEdition}`),
      fetch(`${SURAH_API_BASE}/${surahId}/${translationEdition}`),
    ]);

    if (!arabicResponse.ok || !translationResponse.ok) {
      throw new Error('Failed to fetch one or both editions');
    }

    const [arabicJson, translationJson] = await Promise.all([
      arabicResponse.json(),
      translationResponse.json(),
    ]);

    if (arabicJson.code !== 200 || translationJson.code !== 200) {
      throw new Error('Invalid API response');
    }

    const arabicData = arabicJson.data;
    const translationData = translationJson.data;

    // Merge Arabic and translation
    const surah: Surah = {
      number: arabicData.number,
      name: arabicData.name,
      englishName: arabicData.englishName,
      englishNameTranslation: arabicData.englishNameTranslation,
      numberOfAyahs: arabicData.numberOfAyahs,
      revelationType: arabicData.revelationType,
      verses: arabicData.ayahs.map((ayah: any, index: number) => ({
        number: {
          inQuran: ayah.number,
          inSurah: ayah.numberInSurah,
        },
        text: ayah.text,
        translation: translationData.ayahs[index]?.text || '',
      })),
    };

    // Cache the merged result
    await set(cacheKey, surah);
    console.log(`[Quran] Cached Surah ${surahId} with translation`);

    return surah;
  } catch (error) {
    console.error(`[Quran] Failed to get Surah ${surahId} with translation:`, error);
    return null;
  }
}

/**
 * Get the list of all Surahs with Offline-First strategy.
 * 
 * @returns Array of SurahInfo or empty array if unavailable
 */
export async function getSurahList(): Promise<SurahInfo[]> {
  try {
    // Check cache first
    const cachedList = await get(SURAH_LIST_KEY);
    if (cachedList) {
      console.log('[Quran] Surah list loaded from cache');
      return cachedList as SurahInfo[];
    }

    console.log('[Quran] Fetching Surah list from API...');

    const response = await fetch(`${SURAH_API_BASE}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.code !== 200 || !json.data) {
      throw new Error('Invalid API response');
    }

    const surahList: SurahInfo[] = json.data;

    // Cache the list
    await set(SURAH_LIST_KEY, surahList);
    console.log('[Quran] Surah list cached to IndexedDB');

    return surahList;
  } catch (error) {
    console.error('[Quran] Failed to get Surah list:', error);
    return [];
  }
}

/**
 * Check if a Surah is available offline.
 * 
 * @param surahId - The Surah number
 * @param edition - The edition to check
 */
export async function isSurahCached(
  surahId: number,
  edition: string = 'quran-uthmani'
): Promise<boolean> {
  const cacheKey = `${SURAH_DATA_PREFIX}${surahId}_${edition}`;
  const data = await get(cacheKey);
  return data !== undefined;
}

/**
 * Prefetch a Surah in the background (for preloading).
 * 
 * @param surahId - The Surah number to prefetch
 */
export async function prefetchSurah(surahId: number): Promise<void> {
  // Just call getSurah - it will cache if not already cached
  await getSurah(surahId);
}
