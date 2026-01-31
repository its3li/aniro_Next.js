'use client';

import { useState, useCallback, useRef } from 'react';
import MiniSearch, { SearchResult } from 'minisearch';
import { get, set, keys } from 'idb-keyval';

// Types for search results
export interface QuranSearchResult {
    id: string;
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumber: number;
    ayahText: string;
    score: number;
}

interface IndexedAyah {
    id: string;
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumber: number;
    ayahText: string;
    normalizedText: string;
}

// Arabic Tashkeel (diacritics) regex
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Arabic letter normalization
const ARABIC_NORMALIZATION_MAP: Record<string, string> = {
    'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
    'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه', 'ى': 'ي',
};

// Cache key for the serialized index
const SEARCH_INDEX_CACHE_KEY = 'quran_search_index_v1';

export function normalizeArabic(text: string): string {
    if (!text) return '';
    let normalized = text.replace(TASHKEEL_REGEX, '');
    for (const [from, to] of Object.entries(ARABIC_NORMALIZATION_MAP)) {
        normalized = normalized.replace(new RegExp(from, 'g'), to);
    }
    return normalized.trim();
}

function processTerm(term: string): string {
    return normalizeArabic(term).toLowerCase();
}

export function useQuranSearch() {
    const [isIndexing, setIsIndexing] = useState(false);
    const [isIndexed, setIsIndexed] = useState(false);
    const [searchResults, setSearchResults] = useState<QuranSearchResult[]>([]);

    const miniSearchRef = useRef<MiniSearch<IndexedAyah> | null>(null);
    const indexingPromiseRef = useRef<Promise<void> | null>(null);

    // Create MiniSearch instance with config
    const createMiniSearch = useCallback(() => {
        return new MiniSearch<IndexedAyah>({
            fields: ['normalizedText', 'ayahText'],
            storeFields: ['surahNumber', 'surahName', 'surahEnglishName', 'ayahNumber', 'ayahText'],
            searchOptions: {
                boost: { normalizedText: 2, ayahText: 1 },
                fuzzy: 0.1,
                prefix: true,
                combineWith: 'AND',
            },
            processTerm,
        });
    }, []);

    // Load index from cache or build it
    const buildIndex = useCallback(async (): Promise<void> => {
        if (indexingPromiseRef.current) return indexingPromiseRef.current;
        if (isIndexed && miniSearchRef.current) return Promise.resolve();

        const indexPromise = (async () => {
            try {
                // Try to load from cache first
                const cachedIndex = await get(SEARCH_INDEX_CACHE_KEY);
                if (cachedIndex) {
                    miniSearchRef.current = MiniSearch.loadJSON(cachedIndex, {
                        fields: ['normalizedText', 'ayahText'],
                        storeFields: ['surahNumber', 'surahName', 'surahEnglishName', 'ayahNumber', 'ayahText'],
                        processTerm,
                    });
                    setIsIndexed(true);
                    console.log('[QuranSearch] Loaded index from cache');
                    return;
                }

                // No cache - build index silently
                setIsIndexing(true);
                const miniSearch = createMiniSearch();
                const allDocuments: IndexedAyah[] = [];

                const allKeys = await keys();
                const surahKeys = allKeys.filter(
                    (key) => typeof key === 'string' && key.startsWith('surah_') && !key.includes('list')
                );

                for (const key of surahKeys) {
                    const surahData = await get(key as string);
                    if (!surahData) continue;

                    const ayahs = surahData.ayahs || surahData.verses || [];
                    for (const ayah of ayahs) {
                        const ayahNumber = ayah.numberInSurah || ayah.number?.inSurah || 0;
                        const ayahText = ayah.text || '';
                        allDocuments.push({
                            id: `${surahData.number}:${ayahNumber}`,
                            surahNumber: surahData.number,
                            surahName: surahData.name,
                            surahEnglishName: surahData.englishName,
                            ayahNumber,
                            ayahText,
                            normalizedText: normalizeArabic(ayahText),
                        });
                    }
                }

                if (allDocuments.length > 0) {
                    miniSearch.addAll(allDocuments);
                    // Cache the serialized index
                    const serialized = JSON.stringify(miniSearch);
                    await set(SEARCH_INDEX_CACHE_KEY, serialized);
                    console.log(`[QuranSearch] Built and cached index with ${allDocuments.length} ayahs`);
                }

                miniSearchRef.current = miniSearch;
                setIsIndexed(true);
            } catch (err) {
                console.error('[QuranSearch] Indexing failed:', err);
            } finally {
                setIsIndexing(false);
            }
        })();

        indexingPromiseRef.current = indexPromise;
        return indexPromise;
    }, [isIndexed, createMiniSearch]);

    // Prebuild index in background
    const prebuildIndex = useCallback(() => {
        buildIndex();
    }, [buildIndex]);

    // Search function
    const search = useCallback(async (query: string): Promise<QuranSearchResult[]> => {
        if (!query.trim()) {
            setSearchResults([]);
            return [];
        }

        await buildIndex();

        if (!miniSearchRef.current) return [];

        const results = miniSearchRef.current.search(query);
        const mappedResults: QuranSearchResult[] = results.map((result: SearchResult) => ({
            id: result.id as string,
            surahNumber: result.surahNumber as number,
            surahName: result.surahName as string,
            surahEnglishName: result.surahEnglishName as string,
            ayahNumber: result.ayahNumber as number,
            ayahText: result.ayahText as string,
            score: result.score,
        }));

        setSearchResults(mappedResults);
        return mappedResults;
    }, [buildIndex]);

    const clearResults = useCallback(() => {
        setSearchResults([]);
    }, []);

    return {
        search,
        searchResults,
        clearResults,
        isIndexing,
        isIndexed,
        prebuildIndex,
    };
}
