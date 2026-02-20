'use client';

import { useState, useCallback, useRef } from 'react';
import MiniSearch, { SearchResult } from 'minisearch';
import { get, set } from 'idb-keyval';

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

interface CompactAyah {
    id: string;
    s: number;
    n: string;
    e: string;
    a: number;
    t: string;
    ed: string;
}

// Arabic Tashkeel (diacritics) regex
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Arabic letter normalization
const ARABIC_NORMALIZATION_MAP: Record<string, string> = {
    'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
    'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه', 'ى': 'ي',
};

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

// Build index from bundled documents - LAZY loading
async function buildIndexFromDocuments(): Promise<MiniSearch<any> | null> {
    try {
        const response = await fetch('/data/quran/search/all-ayat.json');
        if (!response.ok) {
            return null;
        }
        const compactDocs: CompactAyah[] = await response.json();
        
        const miniSearch = new MiniSearch({
            fields: ['normalizedText', 'ayahText', 'surahName'],
            storeFields: ['surahNumber', 'surahName', 'surahEnglishName', 'ayahNumber', 'ayahText', 'edition'],
            searchOptions: {
                boost: { normalizedText: 3, ayahText: 1, surahName: 2 },
                fuzzy: 0.15,
                prefix: true,
                combineWith: 'AND',
            },
            processTerm,
        });
        
        const documents = compactDocs.map(d => ({
            id: d.id,
            surahNumber: d.s,
            surahName: d.n,
            surahEnglishName: d.e,
            ayahNumber: d.a,
            ayahText: d.t,
            edition: d.ed,
            normalizedText: normalizeArabic(d.t),
        }));
        
        // Add in chunks to avoid blocking
        const CHUNK_SIZE = 500;
        for (let i = 0; i < documents.length; i += CHUNK_SIZE) {
            const chunk = documents.slice(i, i + CHUNK_SIZE);
            miniSearch.addAll(chunk);
            // Yield to main thread
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        return miniSearch;
    } catch (err) {
        console.error('[QuranSearch] Failed to build:', err);
        return null;
    }
}

const INDEX_CACHE_KEY = 'quran_search_index_v3';

export function useQuranSearch() {
    const [isIndexing, setIsIndexing] = useState(false);
    const [isIndexed, setIsIndexed] = useState(false);
    const [searchResults, setSearchResults] = useState<QuranSearchResult[]>([]);

    const miniSearchRef = useRef<MiniSearch<any> | null>(null);
    const initPromiseRef = useRef<Promise<void> | null>(null);

    // Initialize search index - LAZY: only when needed
    const initIndex = useCallback(async (): Promise<void> => {
        if (initPromiseRef.current) return initPromiseRef.current;
        if (isIndexed && miniSearchRef.current) return Promise.resolve();

        const initPromise = (async () => {
            setIsIndexing(true);
            try {
                // Try IndexedDB cache first (fast)
                const cached = await get(INDEX_CACHE_KEY);
                if (cached) {
                    // Use setTimeout to avoid blocking UI during load
                    await new Promise(resolve => setTimeout(resolve, 0));
                    miniSearchRef.current = MiniSearch.loadJSON(cached, {
                        fields: ['normalizedText', 'ayahText', 'surahName'],
                        storeFields: ['surahNumber', 'surahName', 'surahEnglishName', 'ayahNumber', 'ayahText', 'edition'],
                        processTerm,
                    });
                    setIsIndexed(true);
                    return;
                }

                // Build fresh index
                const miniSearch = await buildIndexFromDocuments();

                if (miniSearch) {
                    miniSearchRef.current = miniSearch;
                    setIsIndexed(true);
                    // Cache for next time (async, don't wait)
                    set(INDEX_CACHE_KEY, JSON.stringify(miniSearch)).catch(() => {});
                }
            } catch (err) {
                console.error('[QuranSearch] Init failed:', err);
            } finally {
                setIsIndexing(false);
            }
        })();

        initPromiseRef.current = initPromise;
        return initPromise;
    }, [isIndexed]);

    // Search function - lazy load only when user searches
    const search = useCallback(async (query: string): Promise<QuranSearchResult[]> => {
        if (!query.trim()) {
            setSearchResults([]);
            return [];
        }

        await initIndex();

        if (!miniSearchRef.current) {
            return [];
        }

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
    }, [initIndex]);

    const clearResults = useCallback(() => {
        setSearchResults([]);
    }, []);

    return {
        search,
        searchResults,
        clearResults,
        isIndexing,
        isIndexed,
    };
}
