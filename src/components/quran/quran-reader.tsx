
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Surah, Verse } from '@/lib/quran';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, PlayCircle, PauseCircle, Copy, BookmarkPlus, BookOpen } from 'lucide-react';
import { TafseerModal } from './tafseer-modal';
import { useSettings } from '../providers/settings-provider';
import { parseTajweed, stripTajweed } from '@/lib/tajweed';
import { TajweedLegend } from './tajweed-legend';
import { MushafPageView } from './mushaf-page-view';
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
  const { settings } = useSettings();
  const { quranViewMode, language, quranEdition } = settings;
  const isArabic = language === 'ar';
  const { toast } = useToast();

  // Calculate Juz once based on surah - no dynamic tracking
  const juz = useMemo(() => getJuzForSurah(surah.number), [surah.number]);
  const hizb = useMemo(() => (juz - 1) * 2 + 1, [juz]);

  const { playerState, playVerse, playSurah, handlePlayPause, handlePlayerClose } = useAudioPlayer();

  const [selectedVerseForTafseer, setSelectedVerseForTafseer] = useState<Verse | null>(null);
  const [isTafseerOpen, setTafseerOpen] = useState(false);
  const [selectedVerseForPopup, setSelectedVerseForPopup] = useState<Verse | null>(null);

  const verseRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  // Scroll to active verse
  useEffect(() => {
    const activeKey = playerState.activeVerseKey;
    if (activeKey && playerState.isPlaying) {
      setTimeout(() => {
        verseRefs.current.get(activeKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [playerState.activeVerseKey, playerState.isPlaying]);

  // Scroll to initial verse (from search) — list mode only
  useEffect(() => {
    if (quranViewMode === 'page') return; // Page mode handles this internally
    if (surah && typeof surah.number === 'number' && typeof initialVerseNumber === 'number') {
      const verseKey = `${surah.number}:${initialVerseNumber}`;
      setTimeout(() => {
        const element = verseRefs.current.get(verseKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-primary/20');
          setTimeout(() => {
            element.classList.remove('bg-primary/20');
          }, 2000);
        }
      }, 500);
    }
  }, [surah, initialVerseNumber, quranViewMode]);


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
    setSelectedVerseForPopup(verse);
  };

  // Show popup immediately on click (no delay)
  const handleVerseClick = (verse: Verse) => {
    setSelectedVerseForPopup(prev => prev?.number.inQuran === verse.number.inQuran ? null : verse);
  };

  const handleCopyVerse = (verse: Verse) => {
    const textToCopy = `${stripTajweed(verse.text)} (${isArabic ? surah.name : surah.englishName}:${verse.number.inSurah})`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: isArabic ? 'تم نسخ الآية' : 'Verse copied' });
    setSelectedVerseForPopup(null);
  };

  const handleBookmarkVerse = (verse: Verse) => {
    toast({ title: isArabic ? 'تم حفظ العلامة' : 'Bookmark saved', description: `${isArabic ? surah.name : surah.englishName} • ${isArabic ? 'الآية' : 'Ayah'} ${verse.number.inSurah}` });
    setSelectedVerseForPopup(null);
  };

  const handleOpenTafseer = (verse: Verse) => {
    setSelectedVerseForTafseer(verse);
    setTafseerOpen(true);
    setSelectedVerseForPopup(null);
  };

  const isSurahPlaying = playerState.isContinuous && playerState.isPlaying;

  // Fixed popup position tracking for list view
  const [popupRect, setPopupRect] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!selectedVerseForPopup) {
      setPopupRect(null);
      return;
    }

    const verseKey = `${surah.number}:${selectedVerseForPopup.number.inSurah}`;
    const verseEl = verseRefs.current.get(verseKey);
    if (verseEl) {
      const rect = verseEl.getBoundingClientRect();
      const popupWidth = 180;
      const padding = 8;
      
      // Center horizontally, clamp to screen edges
      let left = rect.left + (rect.width / 2) - (popupWidth / 2);
      left = Math.max(padding, Math.min(left, window.innerWidth - popupWidth - padding));
      
      // Position above the verse
      const top = rect.top - 60;
      
      setPopupRect({ top, left });
    }
  }, [selectedVerseForPopup, surah.number]);

  // Close popup on scroll or resize
  useEffect(() => {
    const handleScroll = () => setSelectedVerseForPopup(null);
    const handleResize = () => setSelectedVerseForPopup(null);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      {quranViewMode === 'page' ? (
        <MushafPageView surahNumber={surah.number} initialVerseNumber={initialVerseNumber} onBack={onBack} />
      ) : (
        <>
          {/* Header — native sticky app bar */}
          <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2.5 safe-area-top">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="shrink-0 w-9 h-9" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold truncate">{isArabic ? surah.name : surah.englishName}</h1>
                <p className="text-xs text-muted-foreground truncate">{isArabic ? surah.englishName : surah.name}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 w-9 h-9" onClick={handleToggleContinuousPlay}>
                {isSurahPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
              </Button>
            </div>
          </header>

          {/* Tajweed legend */}
          {quranEdition === 'tajweed' && (
            <div className="sticky top-[52px] z-10">
              <TajweedLegend />
            </div>
          )}
          <div className="px-4 py-3">
            <div className="flex flex-col gap-2">
              {surah.verses.map((verse) => {
                const verseKey = `${surah.number}:${verse.number.inSurah}`;
                const isPlaying = playerState.activeVerseKey === verseKey && playerState.isPlaying;
                const isVerseActive = playerState.activeVerseKey === verseKey;
                const isSelected = selectedVerseForPopup?.number.inQuran === verse.number.inQuran;
                return (
                  <div
                    key={verse.number.inQuran}
                    ref={el => { verseRefs.current.set(verseKey, el); }}
                    onClick={() => handleVerseClick(verse)}
                    className={cn("relative bg-card border border-border p-4 rounded-xl text-center cursor-pointer overflow-hidden select-none touch-manipulation", isVerseActive && 'bg-primary/10', isSelected && 'bg-primary/10 ring-2 ring-primary/30')}
                  >
                    <p className="text-right font-quran text-xl leading-loose">
                      {quranEdition === 'tajweed' ? (
                        <span dangerouslySetInnerHTML={{ __html: parseTajweed(verse.text) }} />
                      ) : (
                        verse.text
                      )}
                      <span className="text-primary font-sans text-sm mx-1.5">
                        ({verse.number.inSurah})
                      </span>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fixed popup using Portal — instant, no delay, stays on screen */}
          {selectedVerseForPopup && popupRect && typeof window !== 'undefined' && createPortal(
            <div
              className="fixed z-[9999] flex items-center gap-1 bg-background shadow-xl rounded-full px-2 py-1.5 border border-border"
              style={{
                top: Math.max(8, popupRect.top),
                left: popupRect.left,
                width: '180px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const verse = selectedVerseForPopup;
                const verseKey = `${surah.number}:${verse.number.inSurah}`;
                const isPlaying = playerState.activeVerseKey === verseKey && playerState.isPlaying;
                return (
                  <>
                    <button 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors" 
                      onClick={() => handleVersePlayClick(verse)}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors" 
                      onClick={() => handleCopyVerse(verse)}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors" 
                      onClick={() => handleBookmarkVerse(verse)}
                    >
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                    <button 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors outline-none focus:outline-none focus-visible:outline-none" 
                      onClick={() => handleOpenTafseer(verse)}
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>
                  </>
                );
              })()}
            </div>,
            document.body
          )}
        </>
      )}

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
