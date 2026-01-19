
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { QuranAudioPlayer } from './quran-audio-player';
import { ReciterSelectModal } from './reciter-select-modal';

interface QuranReaderProps {
  surah: Surah;
  onBack: () => void;
}

export function QuranReader({ surah, onBack }: QuranReaderProps) {
  const { settings, setQuranViewMode, setQuranEdition, setQuranReciter } = useSettings();
  const { quranViewMode, language, quranEdition, quranReciter } = settings;
  const isArabic = language === 'ar';
  const { toast } = useToast();

  const [selectedVerseForTafseer, setSelectedVerseForTafseer] = useState<Verse | null>(null);
  const [isTafseerOpen, setTafseerOpen] = useState(false);
  const [isReciterModalOpen, setReciterModalOpen] = useState(false);
  
  const [playerState, setPlayerState] = useState({
    showPlayer: false,
    isPlaying: false,
    isRepeating: false,
    isContinuous: false,
    activeVerseKey: null as string | null,
    progress: 0,
    duration: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const audioQueueRef = useRef<{ verseKey: string; url: string }[]>([]);
  const isSeekingRef = useRef(false);
  const playerStateRef = useRef(playerState);

  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  const getVerseByKey = useCallback((key: string | null): Verse | undefined => {
    if (!key) return undefined;
    const verseNum = parseInt(key.split(':')[1]);
    return surah.verses.find(v => v.number.inSurah === verseNum);
  }, [surah.verses]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    audioQueueRef.current = [];
  }, []);

  const handlePlayerClose = useCallback(() => {
    cleanupAudio();
    setPlayerState({
      showPlayer: false,
      isPlaying: false,
      isRepeating: false,
      isContinuous: false,
      activeVerseKey: null,
      progress: 0,
      duration: 0,
    });
  }, [cleanupAudio]);

  const fillAudioQueue = useCallback(async (startVerseIndex: number) => {
    if (startVerseIndex >= surah.verses.length) return;
    
    const versesToQueue = surah.verses.slice(startVerseIndex, startVerseIndex + 5);
    const promises = versesToQueue.map(async (verse) => {
        try {
            const verseRef = `${surah.number}:${verse.number.inSurah}`;
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseRef}/${quranReciter}`);
            if (!response.ok) return null;
            const data = await response.json();
            if (data.code !== 200 || !data.data.audio) return null;
            return { verseKey: verseRef, url: data.data.audio };
        } catch {
            return null;
        }
    });
    const results = (await Promise.all(promises)).filter((r): r is { verseKey: string; url: string } => r !== null);
    const existingKeys = new Set(audioQueueRef.current.map(item => item.verseKey));
    const newItems = results.filter(item => !existingKeys.has(item.verseKey));
    audioQueueRef.current.push(...newItems);
  }, [quranReciter, surah.number, surah.verses]);

  const playNextInQueue = useCallback(() => {
    // Proactively fill queue for continuous play
    if (playerStateRef.current.isContinuous) {
      // When we are about to play the 4th verse of a 5-verse batch, 
      // the queue will have 2 items left. This is the time to load more.
      if (audioQueueRef.current.length === 2) {
        const lastQueuedVerseKey = audioQueueRef.current[audioQueueRef.current.length - 1].verseKey;
        const lastVerse = getVerseByKey(lastQueuedVerseKey);
        if (lastVerse) {
          const lastVerseIndex = surah.verses.findIndex(v => v.number.inSurah === lastVerse.number.inSurah);
          const nextVerseIndexToQueue = lastVerseIndex + 1;
          if (nextVerseIndexToQueue < surah.verses.length) {
            fillAudioQueue(nextVerseIndexToQueue);
          }
        }
      }
    }

    if (audioQueueRef.current.length === 0) {
      if (playerStateRef.current.isContinuous) {
        handlePlayerClose(); // Surah finished
      }
      return;
    }
  
    const { verseKey, url } = audioQueueRef.current.shift()!;
    const verse = getVerseByKey(verseKey);
    if (!verse) {
      if (playerStateRef.current.isContinuous) playNextInQueue();
      return;
    }
  
    setPlayerState(s => ({ ...s, isPlaying: true, activeVerseKey: verseKey, progress: 0, duration: 0, showPlayer: true }));
    verseRefs.current.get(verseKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
    const newAudio = new Audio(url);
    audioRef.current = newAudio;
  
    newAudio.onloadedmetadata = () => setPlayerState(s => s.activeVerseKey === verseKey ? { ...s, duration: newAudio.duration } : s);
    newAudio.ontimeupdate = () => {
      if (!isSeekingRef.current) {
        setPlayerState(s => s.activeVerseKey === verseKey ? { ...s, progress: newAudio.currentTime } : s);
      }
    };
    newAudio.onerror = () => {
      console.error("Audio playback error for", url);
      if (playerStateRef.current.isContinuous) {
        playNextInQueue();
      } else {
        handlePlayerClose();
      }
    };
    newAudio.onended = () => {
      if (isSeekingRef.current) return;
      
      if (playerStateRef.current.isContinuous) {
        playNextInQueue();
      } else if (playerStateRef.current.isRepeating) {
        newAudio.currentTime = 0;
        newAudio.play().catch(newAudio.onerror);
      } else {
        setPlayerState(s => ({ ...s, isPlaying: false, progress: 0 }));
      }
    };
  
    newAudio.play().catch(newAudio.onerror);
  }, [getVerseByKey, handlePlayerClose, surah.verses, fillAudioQueue]);

  const startPlayback = useCallback(async (verseKey: string, isContinuous: boolean) => {
    cleanupAudio();
    setPlayerState(s => ({
      ...s,
      isContinuous: isContinuous,
      // Disable repeating when continuous play is active
      isRepeating: isContinuous ? false : s.isRepeating,
      activeVerseKey: verseKey,
      showPlayer: true,
      isPlaying: true
    }));

    if (isContinuous) {
      const startIdx = surah.verses.findIndex(v => `${surah.number}:${v.number.inSurah}` === verseKey);
      await fillAudioQueue(startIdx);
      playNextInQueue();
    } else {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/${quranReciter}`);
        const result = await response.json();
        if (result.code !== 200 || !result.data.audio) throw new Error('Failed to fetch audio');
        audioQueueRef.current = [{verseKey, url: result.data.audio}];
        playNextInQueue();
      } catch (error) {
        console.error("Failed to start playback:", error);
        handlePlayerClose();
      }
    }
  }, [cleanupAudio, fillAudioQueue, playNextInQueue, quranReciter, surah.number, surah.verses, handlePlayerClose]);
  
  const ensureReciterIsSet = (callback: () => void) => {
    const hasSetReciter = localStorage.getItem('hasSetReciter') === 'true';
    if (hasSetReciter) {
      callback();
    } else {
      setReciterModalOpen(true);
      // We will trigger the callback from the modal's onSelect
    }
  };

  const handleReciterSelect = (reciterIdentifier: string) => {
    setQuranReciter(reciterIdentifier);
    localStorage.setItem('hasSetReciter', 'true');
    setReciterModalOpen(false);
    // Now trigger the pending action, e.g. play the verse that was clicked
    // This part is tricky. A simple approach is to just let the user click play again.
  }

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      audioRef.current?.pause();
      setPlayerState(s => ({...s, isPlaying: false}));
    } else if (audioRef.current) {
      audioRef.current.play().catch(() => handlePlayerClose());
      setPlayerState(s => ({...s, isPlaying: true}));
    } else if (playerState.activeVerseKey) {
        startPlayback(playerState.activeVerseKey, playerState.isContinuous);
    }
  };

  const handleNext = () => {
    if (playerState.isContinuous) {
        playNextInQueue();
    } else if (playerState.activeVerseKey) {
        const verse = getVerseByKey(playerState.activeVerseKey);
        if(!verse) return;
        const currentIdx = surah.verses.findIndex(v => v.number.inSurah === verse.number.inSurah);
        if (currentIdx < surah.verses.length - 1) {
            startPlayback(`${surah.number}:${surah.verses[currentIdx + 1].number.inSurah}`, false);
        }
    }
  };

  const handlePrev = () => {
    if (playerState.activeVerseKey) {
        const verse = getVerseByKey(playerState.activeVerseKey);
        if(!verse) return;
        const currentIdx = surah.verses.findIndex(v => v.number.inSurah === verse.number.inSurah);
        if (currentIdx > 0) {
            startPlayback(`${surah.number}:${surah.verses[currentIdx - 1].number.inSurah}`, playerState.isContinuous);
        }
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setPlayerState(s => ({ ...s, progress: value }));
    }
  };
  
  const handleRepeatToggle = () => {
    if(!playerState.isContinuous) {
      setPlayerState(s => ({ ...s, isRepeating: !s.isRepeating }));
    }
  };
  
  const handleVersePlayClick = (verse: Verse) => {
    const verseKey = `${surah.number}:${verse.number.inSurah}`;
    if (playerState.activeVerseKey === verseKey && playerState.isPlaying) {
      handlePlayPause();
    } else {
      ensureReciterIsSet(() => startPlayback(verseKey, false));
    }
  };
  
  const handleToggleContinuousPlay = () => {
      if (playerState.isContinuous && playerState.isPlaying) {
          handlePlayPause(); // Just pause
      } else {
          ensureReciterIsSet(() => {
              const startVerseKey = playerState.activeVerseKey || `${surah.number}:${surah.verses[0].number.inSurah}`;
              startPlayback(startVerseKey, true);
          });
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
  
  const activeVerse = getVerseByKey(playerState.activeVerseKey);
  const isSurahPlaying = playerState.isContinuous && playerState.isPlaying;

  return (
    <div className='pb-40'>
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-lg border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div className="text-center">
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
                    <SelectItem value="shubah" disabled>{isArabic ? "شعبة عن عاصم" : "Shu'bah 'an 'Asim"}</SelectItem>
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
                    <Book className={quranViewMode === 'page' ? 'text-primary' : ''}/>
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
            )})}
          </div>
        ) : (
          <div className="bg-foreground/5 p-6 rounded-2xl">
            <p className="font-quran text-3xl leading-loose text-right">
              {surah.verses.map(verse => {
                const verseKey = `${surah.number}:${verse.number.inSurah}`;
                const isPlaying = playerState.activeVerseKey === verseKey && playerState.isPlaying;
                const isVerseActive = playerState.activeVerseKey === verseKey;
                return (
                <span key={verse.number.inQuran} ref={el => verseRefs.current.set(verseKey, el)} onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }} className={cn("relative group transition-colors", isVerseActive && 'text-primary')}>
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
              )})}
            </p>
          </div>
        )}
      </div>

      <QuranAudioPlayer
        isOpen={playerState.showPlayer}
        isPlaying={playerState.isPlaying}
        surahName={isArabic ? surah.name : surah.englishName}
        verseNumber={activeVerse?.number.inSurah || 0}
        progress={playerState.progress}
        duration={playerState.duration}
        isRepeating={playerState.isRepeating}
        isContinuousPlay={playerState.isContinuous}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onRepeatToggle={handleRepeatToggle}
        onReciterChange={setQuranReciter}
        onClose={handlePlayerClose}
      />
      
      {selectedVerseForTafseer && (
        <TafseerModal 
          verse={selectedVerseForTafseer} 
          surahName={isArabic ? surah.name : surah.englishName}
          surahNumber={surah.number}
          isOpen={isTafseerOpen} 
          onClose={() => setTafseerOpen(false)} 
        />
      )}

      <ReciterSelectModal 
        isOpen={isReciterModalOpen}
        onClose={() => setReciterModalOpen(false)}
        onSelect={handleReciterSelect}
      />
    </div>
  );
}
