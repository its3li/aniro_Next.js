
'use client';
import { useState, useEffect } from 'react';
import { SurahList } from '@/components/quran/surah-list';
import { QuranReader } from '@/components/quran/quran-reader';
import type { Surah, SurahInfo } from '@/lib/quran';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/components/providers/settings-provider';

export default function QuranPage() {
  const [selectedSurahInfo, setSelectedSurahInfo] = useState<SurahInfo | null>(null);
  const [fullSurah, setFullSurah] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  useEffect(() => {
    if (!selectedSurahInfo) {
      setFullSurah(null);
      return;
    }

    const fetchSurah = async () => {
      setIsLoading(true);
      try {
        // Using quran.com API v4
        // Translation ID 131 is for "Dr. Mustafa Khattab, the Clear Quran"
        const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${selectedSurahInfo.number}?language=en&words=false&translations=131&fields=text_uthmani`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        const combinedVerses: Surah['verses'] = data.verses.map((verse: any) => ({
          number: { inQuran: verse.id, inSurah: verse.verse_number },
          text: verse.text_uthmani,
          translation: verse.translations?.[0]?.text.replace(/<[^>]*>/g, '') || 'Translation not available.',
        }));

        setFullSurah({
          ...selectedSurahInfo,
          verses: combinedVerses,
        });

      } catch (error) {
        console.error("Failed to fetch Surah data:", error);
        toast({
            variant: "destructive",
            title: "Failed to load Surah",
            description: "Please check your internet connection and try again.",
        });
        setSelectedSurahInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurah();
  }, [selectedSurahInfo, toast]);

  const handleBack = () => {
    setSelectedSurahInfo(null);
    setFullSurah(null);
  }

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
      return <QuranReader surah={fullSurah} onBack={handleBack} />;
    }

    return (
      <div className="p-4 md:p-6">
          <h1 className="text-3xl font-bold font-headline mb-6">{isArabic ? 'القرآن الكريم' : 'The Holy Quran'}</h1>
          <SurahList onSurahSelect={setSelectedSurahInfo} />
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-in">
      {renderContent()}
    </div>
  );
}
