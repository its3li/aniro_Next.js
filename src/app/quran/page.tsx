'use client';
import { useState } from 'react';
import { SurahList } from '@/components/quran/surah-list';
import { QuranReader } from '@/components/quran/quran-reader';
import type { Surah } from '@/lib/quran';

export default function QuranPage() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  return (
    <div className="animate-fade-slide-in">
      {selectedSurah ? (
        <QuranReader surah={selectedSurah} onBack={() => setSelectedSurah(null)} />
      ) : (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold font-headline mb-6">The Holy Quran</h1>
            <SurahList onSurahSelect={setSelectedSurah} />
        </div>
      )}
    </div>
  );
}
