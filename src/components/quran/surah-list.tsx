'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { SurahInfo } from '@/lib/quran';
import { getSurahList } from '@/lib/quran';
import { Input } from '@/components/ui/input';
import { GlassCard } from '../glass-card';
import { useSettings } from '../providers/settings-provider';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2, BookOpen, ChevronDown } from 'lucide-react';
import { useQuranSearch, type QuranSearchResult } from '@/hooks/use-quran-search';

// Juz-Surah mapping: which Juz each Surah starts in
const SURAH_JUZ_START: number[] = [
  1, 1, 3, 4, 5, 6, 7, 8, 10, 11, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16,
  17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24,
  24, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30,
  30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
];

// Get Juz range for a Surah
function getJuzRangeForSurah(surahNumber: number): { startJuz: number; endJuz: number } {
  const startJuz = SURAH_JUZ_START[surahNumber - 1] || 1;
  // Find end Juz by checking next surah's start
  const endJuz = surahNumber < 114 ? SURAH_JUZ_START[surahNumber] || startJuz : startJuz;
  return { startJuz, endJuz: Math.max(startJuz, endJuz) };
}

// Get Hizb range (2 Hizb per Juz)
function getHizbRangeForSurah(surahNumber: number): { startHizb: number; endHizb: number } {
  const { startJuz, endJuz } = getJuzRangeForSurah(surahNumber);
  return { startHizb: (startJuz - 1) * 2 + 1, endHizb: endJuz * 2 };
}

const RESULTS_PER_PAGE = 20;

interface SurahListProps {
  onSurahSelect: (surah: SurahInfo, initialVerse?: number) => void;
}

export function SurahList({ onSurahSelect }: SurahListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(RESULTS_PER_PAGE);

  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  // Use the offline verse search hook
  const { search, searchResults, clearResults, isIndexing, prebuildIndex } = useQuranSearch();

  // Load surah list on mount
  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      try {
        const surahList = await getSurahList();
        setSurahs(surahList);
      } catch (error) {
        console.error('Failed to load surah list:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurahs();
    // Pre-build search index in background
    prebuildIndex();
  }, [prebuildIndex]);

  // Debounced verse search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        search(searchTerm);
        setDisplayedCount(RESULTS_PER_PAGE); // Reset pagination on new search
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, search, clearResults]);

  // Handle verse result click - navigate to the verse
  const handleVerseClick = useCallback((result: QuranSearchResult) => {
    router.push(`/quran?surah=${result.surahNumber}&ayah=${result.ayahNumber}`);
  }, [router]);

  // Load more results
  const handleLoadMore = useCallback(() => {
    setDisplayedCount(prev => prev + RESULTS_PER_PAGE);
  }, []);

  // Paginated results - only render what we need
  const displayedResults = useMemo(() => {
    return searchResults.slice(0, displayedCount);
  }, [searchResults, displayedCount]);

  const hasMoreResults = searchResults.length > displayedCount;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const isSearching = searchTerm.trim().length >= 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Verse Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="search"
          placeholder={isArabic ? "ابحث عن آية..." : "Search for a verse..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl h-12"
          dir="auto"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setSearchTerm('');
              clearResults();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Indexing indicator */}
      {isIndexing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isArabic ? 'جارٍ إنشاء الفهرس...' : 'Building search index...'}</span>
        </div>
      )}

      {/* Verse Search Results */}
      {isSearching && searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-lg font-headline">
            {isArabic
              ? `نتائج البحث (${displayedResults.length} من ${searchResults.length})`
              : `Search Results (${displayedResults.length} of ${searchResults.length})`}
          </h3>
          <div className="flex flex-col gap-2">
            {displayedResults.map((result, index) => (
              <GlassCard
                key={`${result.id}-${index}`}
                onClick={() => handleVerseClick(result)}
                className="p-4 cursor-pointer hover:bg-foreground/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span className="font-semibold">
                        {isArabic ? result.surahName : result.surahEnglishName}
                      </span>
                      <span>{isArabic ? `آية ${result.ayahNumber}` : `Ayah ${result.ayahNumber}`}</span>
                    </div>
                    <p className="font-quran text-lg text-right line-clamp-2" dir="rtl">
                      {result.ayahText}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreResults && (
            <Button
              variant="outline"
              className="w-full mt-2 gap-2"
              onClick={handleLoadMore}
            >
              <ChevronDown className="h-4 w-4" />
              {isArabic
                ? `تحميل المزيد (${searchResults.length - displayedCount} متبقي)`
                : `Load More (${searchResults.length - displayedCount} remaining)`}
            </Button>
          )}
        </div>
      )}

      {/* No results */}
      {isSearching && searchResults.length === 0 && !isIndexing && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{isArabic ? 'لم يتم العثور على نتائج' : 'No results found'}</p>
          <p className="text-sm mt-1">
            {isArabic ? 'تأكد من تحميل السور أولاً' : 'Make sure surahs are downloaded first'}
          </p>
        </div>
      )}

      {/* Surah List - only show when not actively searching */}
      {!isSearching && (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-lg font-headline">{isArabic ? 'السور' : 'Surahs'}</h3>
          {surahs.map((surah) => {
            const { startJuz, endJuz } = getJuzRangeForSurah(surah.number);
            const { startHizb, endHizb } = getHizbRangeForSurah(surah.number);
            const juzText = startJuz === endJuz
              ? (isArabic ? `الجزء ${startJuz}` : `Juz ${startJuz}`)
              : (isArabic ? `الجزء ${startJuz} - ${endJuz}` : `Juz ${startJuz}-${endJuz}`);
            const hizbText = startHizb === endHizb
              ? (isArabic ? `الحزب ${startHizb}` : `Hizb ${startHizb}`)
              : (isArabic ? `الحزب ${startHizb} - ${endHizb}` : `Hizb ${startHizb}-${endHizb}`);

            return (
              <GlassCard
                key={surah.number}
                onClick={() => onSurahSelect(surah)}
                className="p-4 flex items-center justify-between cursor-pointer rounded-2xl transition-transform active:scale-95 hover:bg-foreground/10"
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
                    {surah.number}
                  </span>
                  <div>
                    <p className="font-quran text-2xl">{surah.name}</p>
                    <p className="text-sm text-muted-foreground">{surah.numberOfAyahs} {isArabic ? 'آيات' : 'verses'}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold">{juzText}</p>
                  <p className="text-xs text-muted-foreground">{hizbText}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
