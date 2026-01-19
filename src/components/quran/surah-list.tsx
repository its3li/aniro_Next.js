
'use client';
import { useState, useMemo } from 'react';
import { surahs, type SurahInfo } from '@/lib/quran';
import { Input } from '@/components/ui/input';
import { GlassCard } from '../glass-card';

interface SurahListProps {
  onSurahSelect: (surah: SurahInfo) => void;
}

export function SurahList({ onSurahSelect }: SurahListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSurahs = useMemo(() => {
    if (!searchTerm) return surahs;
    return surahs.filter(
      (surah) =>
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.name.includes(searchTerm) ||
        String(surah.number) === searchTerm
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Search Surahs by name or number..."
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
                <p className="font-bold font-headline">{surah.englishName}</p>
                <p className="text-sm text-muted-foreground">{surah.englishNameTranslation}</p>
              </div>
            </div>
            <div className="text-right">
                <p className="font-quran text-2xl">{surah.name}</p>
                <p className="text-sm text-muted-foreground">{surah.numberOfAyahs} verses</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
