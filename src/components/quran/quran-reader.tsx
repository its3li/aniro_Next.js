'use client';
import { useState } from 'react';
import type { Surah, Verse } from '@/lib/quran';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, List } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TafseerModal } from './tafseer-modal';

interface QuranReaderProps {
  surah: Surah;
  onBack: () => void;
}

type ViewMode = 'list' | 'page';

export function QuranReader({ surah, onBack }: QuranReaderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isTafseerOpen, setTafseerOpen] = useState(false);

  const handleLongPress = (verse: Verse) => {
    setSelectedVerse(verse);
    // Here we'd open a custom context menu. For simplicity, we'll just open the tafseer modal.
    setTafseerOpen(true);
  };

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-lg border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold font-headline">{surah.englishName}</h1>
            <p className="text-muted-foreground font-quran text-2xl">{surah.name}</p>
          </div>
          <div className="w-10"></div>
        </div>
        <div className="flex items-center justify-between mt-4 gap-4">
            <Select defaultValue="uthmani">
                <SelectTrigger className="w-auto flex-1 bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl">
                    <SelectValue placeholder="Edition" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="uthmani">Uthmani</SelectItem>
                    <SelectItem value="tajweed" disabled>Color-coded Tajweed</SelectItem>
                </SelectContent>
            </Select>

            <div className='flex items-center gap-2 bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl p-2'>
                <Label htmlFor="view-mode-switch">
                    <List className={viewMode === 'list' ? 'text-primary' : ''} />
                </Label>
                <Switch
                    id="view-mode-switch"
                    checked={viewMode === 'page'}
                    onCheckedChange={(checked) => setViewMode(checked ? 'page' : 'list')}
                />
                 <Label htmlFor="view-mode-switch">
                    <Book className={viewMode === 'page' ? 'text-primary' : ''}/>
                 </Label>
            </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {viewMode === 'list' ? (
          <div className="flex flex-col gap-4">
            {surah.verses.map((verse) => (
              <div
                key={verse.number.inSurah}
                onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }}
                className="bg-foreground/5 p-4 rounded-2xl cursor-pointer"
              >
                <p className="text-right font-quran text-2xl leading-loose mb-4">
                  {verse.text}
                  <span className="text-primary font-sans text-lg mx-2">
                    ({verse.number.inSurah})
                  </span>
                </p>
                <p className="text-muted-foreground leading-relaxed">{verse.translation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-foreground/5 p-6 rounded-2xl">
            <p className="font-quran text-3xl leading-loose text-right">
              {surah.verses.map(verse => (
                <span key={verse.number.inSurah} onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }}>
                  {verse.text}
                  <span className="text-primary font-sans text-xl mx-2">
                    ({verse.number.inSurah})
                  </span>
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
      {selectedVerse && (
        <TafseerModal 
          verse={selectedVerse} 
          surahName={surah.englishName}
          isOpen={isTafseerOpen} 
          onClose={() => setTafseerOpen(false)} 
        />
      )}
    </div>
  );
}
