
'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Surah, Verse } from '@/lib/quran';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, List, Play, Pause, Copy, PlayCircle, PauseCircle } from 'lucide-react';
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
import { useSettings, type QuranEdition } from '../providers/settings-provider';
import { parseTajweed, stripTajweed } from '@/lib/tajweed';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '../providers/audio-player-provider';

// Juz starts at specific Surah numbers
const JUZ_STARTS = [1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78];

function getJuzForSurah(surahNumber: number): number {
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    if (surahNumber >= JUZ_STARTS[i]) return i + 1;
  }
  return 1;
}

interface QuranReaderProps {
  surah: Surah;
  onBack: () => void;
  initialVerseNumber?: number;
}

export function QuranReader({ surah, onBack, initialVerseNumber }: QuranReaderProps) {
  const { settings, setQuranViewMode, setQuranEdition } = useSettings();
  const { quranViewMode, language, quranEdition } = settings;
  const isArabic = language === 'ar';
  const { toast } = useToast();

  // Calculate Juz once based on surah - no dynamic tracking
  const juz = useMemo(() => getJuzForSurah(surah.number), [surah.number]);
  const hizb = useMemo(() => (juz - 1) * 2 + 1, [juz]);

  const { playerState, playVerse, playSurah, handlePlayPause, handlePlayerClose } = useAudioPlayer();

  const [selectedVerseForTafseer, setSelectedVerseForTafseer] = useState<Verse | null>(null);
  const [isTafseerOpen, setTafseerOpen] = useState(false);

  const verseRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  // Scroll to active verse
  useEffect(() => {
    if (playerState.activeVerseKey && playerState.isPlaying) {
      // A short delay to allow the UI to update before scrolling
      setTimeout(() => {
        verseRefs.current.get(playerState.activeVerseKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [playerState.activeVerseKey, playerState.isPlaying]);

  // Scroll to initial verse (from search)
  useEffect(() => {
    if (surah && typeof surah.number === 'number' && typeof initialVerseNumber === 'number') {
      const verseKey = `${surah.number}:${initialVerseNumber}`;
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        const element = verseRefs.current.get(verseKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight class
          element.classList.add('bg-primary/20');
          setTimeout(() => {
            element.classList.remove('bg-primary/20');
          }, 2000);
        }
      }, 500);
    }
  }, [surah, initialVerseNumber]);


  const handleVersePlayClick = (verse: Verse) => {
    const verseKey = `${surah.number}:${verse.number.inSurah}`;
    if (playerState.activeVerseKey === verseKey && playerState.isPlaying) {
      handlePlayPause();
    } else {
      playVerse(surah, verse);
    }
  };

  const handleToggleContinuousPlay = () => {
    const { isPlaying, isContinuous, activeVerseKey } = playerState;
    if (isContinuous && isPlaying) {
      handlePlayerClose();
    } else {
      const startVerse = activeVerseKey ? surah.verses.find(v => `${surah.number}:${v.number.inSurah}` === activeVerseKey) : undefined;
      playSurah(surah, startVerse);
    }
  };

  const handleCopy = (verse: Verse) => {
    const textToCopy = `${stripTajweed(verse.text)} (${isArabic ? surah.name : surah.englishName}:${verse.number.inSurah})`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: isArabic ? 'تم نسخ الآية' : 'Verse copied to clipboard' });
  };

  const handleLongPress = (verse: Verse) => {
    setSelectedVerseForTafseer(verse);
    setTafseerOpen(true);
  };

  const isSurahPlaying = playerState.isContinuous && playerState.isPlaying;

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold font-headline">{isArabic ? surah.name : surah.englishName}</h1>
            <p className="text-muted-foreground font-quran text-2xl">{isArabic ? surah.englishName : surah.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleToggleContinuousPlay}>
            {isSurahPlaying ? <PauseCircle /> : <PlayCircle />}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-4 gap-4">
          <Select value={quranEdition} onValueChange={(value) => setQuranEdition(value as QuranEdition)} dir={isArabic ? 'rtl' : 'ltr'}>
            <SelectTrigger className="w-auto flex-1 bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl">
              <SelectValue placeholder={isArabic ? "الرسم" : "Edition"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uthmani">{isArabic ? "حفص عن عاصم" : "Hafs 'an 'Asim"}</SelectItem>
              <SelectItem value="warsh">{isArabic ? "ورش عن نافع" : "Warsh an-Nafi'"}</SelectItem>
              <SelectItem value="tajweed">{isArabic ? "تجويد ملون" : "Color-coded Tajweed"}</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center gap-2 bg-foreground/5 backdrop-blur-lg border-foreground/10 rounded-xl p-2'>
            <Label htmlFor="view-mode-switch">
              <List className={quranViewMode === 'list' ? 'text-primary' : ''} />
            </Label>
            <Switch
              id="view-mode-switch"
              checked={quranViewMode === 'page'}
              onCheckedChange={(checked) => setQuranViewMode(checked ? 'page' : 'list')}
              dir="ltr"
            />
            <Label htmlFor="view-mode-switch">
              <Book className={quranViewMode === 'page' ? 'text-primary' : ''} />
            </Label>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {quranViewMode === 'list' ? (
          <div className="flex flex-col gap-4">
            {surah.verses.map((verse) => {
              const verseKey = `${surah.number}:${verse.number.inSurah}`;
              const isPlaying = playerState.activeVerseKey === verseKey && playerState.isPlaying;
              const isVerseActive = playerState.activeVerseKey === verseKey;
              return (
                <div
                  key={verse.number.inQuran}
                  ref={el => verseRefs.current.set(verseKey, el)}
                  onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }}
                  className={cn("bg-foreground/5 p-4 rounded-2xl flex items-start gap-4 transition-colors", isVerseActive && 'active-verse-highlight')}
                >
                  <Button variant="ghost" size="icon" className="mt-2" onClick={() => handleVersePlayClick(verse)}>
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <div className='flex-1'>
                    <p className="text-right font-quran text-2xl leading-loose mb-4">
                      {quranEdition === 'tajweed' ? (
                        <span dangerouslySetInnerHTML={{ __html: parseTajweed(verse.text) }} />
                      ) : (
                        verse.text
                      )}
                      <span className="text-primary font-sans text-lg mx-2">
                        ({verse.number.inSurah})
                      </span>
                    </p>
                    <p dir={isArabic ? 'rtl' : 'ltr'} className="text-muted-foreground leading-relaxed">{verse.translation}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-foreground/5 p-6 rounded-2xl">
            <div className="font-quran text-3xl leading-loose text-right">
              {surah.verses.map(verse => {
                const verseKey = `${surah.number}:${verse.number.inSurah}`;
                const isPlaying = playerState.activeVerseKey === verseKey && playerState.isPlaying;
                const isVerseActive = playerState.activeVerseKey === verseKey;
                return (
                  <span key={verse.number.inQuran} ref={el => verseRefs.current.set(verseKey, el)} onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }} className={cn("relative group transition-colors rounded-md", isVerseActive && 'bg-primary/10')}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 p-1 rounded-full bg-background/80 backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      dir="ltr"
                    >
                      <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => handleVersePlayClick(verse)}>
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => handleCopy(verse)}>
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    {quranEdition === 'tajweed' ? (
                      <span dangerouslySetInnerHTML={{ __html: parseTajweed(verse.text) }} />
                    ) : (
                      <span>{verse.text}</span>
                    )}
                    <span className="text-primary font-sans text-xl mx-2">
                      ({verse.number.inSurah})
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {selectedVerseForTafseer && (
        <TafseerModal
          verse={selectedVerseForTafseer}
          surahName={isArabic ? surah.name : surah.englishName}
          surahNumber={surah.number}
          isOpen={isTafseerOpen}
          onClose={() => setTafseerOpen(false)}
        />
      )}
    </div>
  );
}
