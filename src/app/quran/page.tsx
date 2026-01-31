'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SurahList } from '@/components/quran/surah-list';
import { QuranReader } from '@/components/quran/quran-reader';
import type { Surah, SurahInfo } from '@/lib/quran';
import { getSurahList } from '@/lib/quran';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/components/providers/settings-provider';

export default function QuranPage() {
  const searchParams = useSearchParams();
  const [selectedSurahInfo, setSelectedSurahInfo] = useState<SurahInfo | null>(null);
  const [fullSurah, setFullSurah] = useState<Surah | null>(null);
  const [initialVerseNumber, setInitialVerseNumber] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  // Track if we've already handled URL params (to prevent re-triggering on back)
  const hasHandledParamsRef = useRef(false);

  // Handle URL params for direct navigation (from search results) - ONLY ON INITIAL LOAD
  useEffect(() => {
    // Skip if we've already handled params or no params
    if (hasHandledParamsRef.current) return;

    const surahParam = searchParams.get('surah');
    const ayahParam = searchParams.get('ayah');

    if (surahParam) {
      hasHandledParamsRef.current = true; // Mark as handled
      const surahNumber = parseInt(surahParam, 10);
      const ayahNumber = ayahParam ? parseInt(ayahParam, 10) : undefined;

      // Fetch surah list and find the surah
      getSurahList().then((surahs) => {
        const surah = surahs.find(s => s.number === surahNumber);
        if (surah) {
          setSelectedSurahInfo(surah);
          setInitialVerseNumber(ayahNumber);
        }
      });
    }
  }, [searchParams]);

  // Fetch full surah when selected
  useEffect(() => {
    if (!selectedSurahInfo) {
      setFullSurah(null);
      return;
    }

    const fetchSurah = async () => {
      setIsLoading(true);
      try {
        const quranEditionMap: Record<string, string> = {
          uthmani: 'quran-uthmani',
          tajweed: 'quran-tajweed',
          warsh: 'quran-warsh',
          shubah: 'quran-shouba',
        };
        const selectedEdition = quranEditionMap[settings.quranEdition] || 'quran-uthmani';
        const translationEdition = isArabic ? 'ar.jalalayn' : 'en.sahih';

        const response = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahInfo.number}/editions/${selectedEdition},${translationEdition}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200 || !data.data || data.data.length < 2) {
          throw new Error("Invalid API response from Al Quran Cloud.");
        }

        const [arabicEdition, translationEditionData] = data.data;

        const combinedVerses: Surah['verses'] = arabicEdition.ayahs.map((ayah: any, index: number) => ({
          number: { inQuran: ayah.number, inSurah: ayah.numberInSurah },
          text: ayah.text,
          translation: translationEditionData.ayahs[index].text,
        }));

        setFullSurah({
          ...selectedSurahInfo,
          verses: combinedVerses,
        });

      } catch (error) {
        console.error("Failed to fetch Surah data:", error);
        toast({
          variant: "destructive",
          title: isArabic ? "فشل تحميل السورة" : "Failed to load Surah",
          description: error instanceof Error ? error.message : (isArabic ? "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." : "Please check your internet connection and try again."),
        });
        setSelectedSurahInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurah();
  }, [selectedSurahInfo, toast, isArabic, settings.quranEdition]);

  const handleBack = () => {
    setSelectedSurahInfo(null);
    setFullSurah(null);
    setInitialVerseNumber(undefined);
    hasHandledParamsRef.current = false; // Reset so next search navigation works
  }

  const handleSurahSelect = (surah: SurahInfo, initialVerse?: number) => {
    setSelectedSurahInfo(surah);
    setInitialVerseNumber(initialVerse);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 md:p-6 space-y-4">
          <h1 className="text-3xl font-bold font-headline mb-2">{isArabic ? 'القرآن الكريم' : 'The Holy Quran'}</h1>
          <Skeleton className="h-12 w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      );
    }

    if (fullSurah) {
      return <QuranReader surah={fullSurah} onBack={handleBack} initialVerseNumber={initialVerseNumber} />;
    }

    return (
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold font-headline mb-6">{isArabic ? 'القرآن الكريم' : 'The Holy Quran'}</h1>
        <SurahList onSurahSelect={handleSurahSelect} />
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      {renderContent()}
    </div>
  );
}
