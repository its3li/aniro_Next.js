
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { SurahInfo } from '@/lib/quran';
import { Input } from '@/components/ui/input';
import { GlassCard } from '../glass-card';
import { useSettings } from '../providers/settings-provider';
import { Skeleton } from '../ui/skeleton';

interface SurahListProps {
  onSurahSelect: (surah: SurahInfo) => void;
}

export function SurahList({ onSurahSelect }: SurahListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        if (!response.ok) {
          throw new Error('Failed to fetch surahs');
        }
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        console.error('Failed to load surah list:', error);
        // Optionally, show a toast to the user
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!surahs.length) return [];
    if (!searchTerm) return surahs;
    return surahs.filter(
      (surah) =>
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name.includes(searchTerm) ||
        String(surah.number) === searchTerm
    );
  }, [searchTerm, surahs]);

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

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder={isArabic ? "ابحث عن السور بالاسم أو الرقم..." : "Search Surahs by name or number..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl h-12"
      />
      <div className="flex flex-col gap-2">
        {filteredSurahs.map((surah) => (
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
                <p className="font-bold font-headline">{isArabic ? surah.name : surah.englishName}</p>
                <p className="text-sm text-muted-foreground">{surah.englishNameTranslation}</p>
              </div>
            </div>
            <div className="text-right">
                <p className="font-quran text-2xl">{isArabic ? surah.englishName : surah.name}</p>
                <p className="text-sm text-muted-foreground">{surah.numberOfAyahs} {isArabic ? 'آيات' : 'verses'}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
