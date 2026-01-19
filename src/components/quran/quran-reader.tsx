
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

  const [audioState, setAudioState] = useState({
    isPlaying: false,
    activeVerseKey: null as string | null,
    showPlayer: false,
    progress: 0,
    duration: 0,
    isRepeating: false,
  });
  const [isContinuousPlay, setContinuousPlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const playerStateRef = useRef({ isContinuousPlay, isRepeating: audioState.isRepeating });
  const audioQueueRef = useRef<{ verseKey: string; url: string }[]>([]);

  useEffect(() => {
    playerStateRef.current = { isContinuousPlay, isRepeating: audioState.isRepeating };
  }, [isContinuousPlay, audioState.isRepeating]);

  const getVerseByKey = useCallback((key: string | null): Verse | undefined => {
    if (!key) return undefined;
    const verseNum = parseInt(key.split(':')[1]);
    return surah.verses.find(v => v.number.inSurah === verseNum);
  }, [surah.verses]);
  
  const handlePlayerClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setAudioState({
      isPlaying: false,
      activeVerseKey: null,
      showPlayer: false,
      progress: 0,
      duration: 0,
      isRepeating: false,
    });
    setContinuousPlay(false);
    audioQueueRef.current = [];
  }, []);

  const fillAudioQueue = useCallback(async (fromVerseIndex: number, count: number) => {
    const versesToFetch = surah.verses.slice(fromVerseIndex, fromVerseIndex + count);
    if (versesToFetch.length === 0) return;

    const promises = versesToFetch.map(async (verse) => {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verse.number.inQuran}/${quranReciter}`);
            if (!response.ok) return null;
            const data = await response.json();
            if (data.code !== 200 || !data.data.audio) return null;
            return { verseKey: `${surah.number}:${verse.number.inSurah}`, url: data.data.audio };
        } catch {
            return null;
        }
    });
    
    const results = (await Promise.all(promises)).filter(item => item !== null);
    audioQueueRef.current.push(...results as {verseKey: string, url: string}[]);

  }, [quranReciter, surah.number, surah.verses]);

  const playFromQueue = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    if (audioQueueRef.current.length === 0) {
      setContinuousPlay(false);
      handlePlayerClose();
      return;
    }
    
    const { verseKey, url } = audioQueueRef.current.shift()!;
    const verse = getVerseByKey(verseKey);
    if (!verse) {
      if (playerStateRef.current.isContinuousPlay) playFromQueue(); // Skip invalid verse and play next
      return;
    }
    
    setAudioState(s => ({ ...s, isPlaying: true, activeVerseKey: verseKey, progress: 0, duration: 0, showPlayer: true }));
    verseRefs.current.get(verseKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const newAudio = new Audio(url);
    audioRef.current = newAudio;

    newAudio.onloadedmetadata = () => setAudioState(s => ({ ...s, duration: newAudio.duration }));
    newAudio.ontimeupdate = () => setAudioState(s => ({ ...s, progress: newAudio.currentTime }));

    newAudio.onerror = () => {
        console.error("Audio playback error for", url);
        if (playerStateRef.current.isContinuousPlay) {
            playFromQueue();
        } else {
            handlePlayerClose();
        }
    };

    newAudio.onended = () => {
        if (playerStateRef.current.isContinuousPlay) {
            const currentIdx = surah.verses.findIndex(v => v.number.inSurah === verse.number.inSurah);
            if (audioQueueRef.current.length < 5 && currentIdx + audioQueueRef.current.length < surah.verses.length - 1) {
                fillAudioQueue(currentIdx + audioQueueRef.current.length + 1, 5);
            }
            playFromQueue();
        } else {
            setAudioState(s => ({ ...s, isPlaying: false, progress: 0 }));
        }
    };
    
    newAudio.play().catch(newAudio.onerror);
  }, [getVerseByKey, handlePlayerClose, fillAudioQueue, surah.verses]);

  const playVerse = useCallback(async (verseKey: string) => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    setContinuousPlay(false);
    audioQueueRef.current = [];

    const verse = getVerseByKey(verseKey);
    if (!verse) { 
      handlePlayerClose();
      return; 
    }

    setAudioState(s => ({ ...s, isPlaying: true, activeVerseKey: verseKey, progress: 0, duration: 0, showPlayer: true }));
    verseRefs.current.get(verseKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verse.number.inQuran}/${quranReciter}`);
        if (!response.ok) throw new Error('Failed to fetch audio data.');
        const result = await response.json();
        if (result.code !== 200 || !result.data.audio) throw new Error('Invalid audio data from API.');
        
        const audioUrl = result.data.audio;
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        newAudio.onloadedmetadata = () => setAudioState(s => ({ ...s, duration: newAudio.duration }));
        newAudio.ontimeupdate = () => setAudioState(s => ({ ...s, progress: newAudio.currentTime }));
        
        newAudio.onerror = () => {
            console.error("Audio playback error for", audioUrl);
            handlePlayerClose();
        };

        newAudio.onended = () => {
            if (playerStateRef.current.isRepeating) {
                newAudio.currentTime = 0;
                newAudio.play();
            } else {
                setAudioState(s => ({ ...s, isPlaying: false, progress: 0 }));
            }
        };

        await newAudio.play();
    } catch (error) {
        console.error("Failed to fetch and play verse:", error);
        handlePlayerClose();
    }
  }, [getVerseByKey, handlePlayerClose, quranReciter]);

  useEffect(() => {
    // This effect handles reciter changes during playback
    if (audioState.isPlaying && audioState.activeVerseKey) {
      if(isContinuousPlay) {
        if(audioRef.current) audioRef.current.pause();
        const startIdx = surah.verses.findIndex(v => `${surah.number}:${v.number.inSurah}` === audioState.activeVerseKey);
        audioQueueRef.current = [];
        fillAudioQueue(startIdx, 10).then(() => playFromQueue());
      } else {
        playVerse(audioState.activeVerseKey);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quranReciter]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      audioRef.current?.pause();
      setAudioState(s => ({ ...s, isPlaying: false }));
    } else if (audioState.activeVerseKey && audioRef.current) {
      audioRef.current?.play().catch(() => {
        // If play fails, it might be because the source is gone. Re-initiate.
        if (isContinuousPlay) {
          handleToggleContinuousPlay();
        } else {
          playVerse(audioState.activeVerseKey!);
        }
      });
      setAudioState(s => ({ ...s, isPlaying: true }));
    } else if (isContinuousPlay) {
      handleToggleContinuousPlay();
    }
  };

  const handleNext = useCallback(() => {
    if (isContinuousPlay) {
      playFromQueue();
    } else {
      const currentVerse = getVerseByKey(audioState.activeVerseKey);
      if (!currentVerse) return;
      const currentIdx = surah.verses.findIndex(v => v.number.inSurah === currentVerse.number.inSurah);
      if (currentIdx < surah.verses.length - 1) {
          const nextVerse = surah.verses[currentIdx + 1];
          playVerse(`${surah.number}:${nextVerse.number.inSurah}`);
      }
    }
  }, [isContinuousPlay, playFromQueue, getVerseByKey, audioState.activeVerseKey, surah.verses, playVerse, surah.number]);

  const handlePrev = () => {
    const currentVerse = getVerseByKey(audioState.activeVerseKey);
    if (!currentVerse) return;
    const currentIdx = surah.verses.findIndex(v => v.number.inSurah === currentVerse.number.inSurah);
    if (currentIdx > 0) {
      const prevVerse = surah.verses[currentIdx - 1];
      const prevVerseKey = `${surah.number}:${prevVerse.number.inSurah}`;
      if (isContinuousPlay) {
        if(audioRef.current) audioRef.current.pause();
        audioQueueRef.current = [];
        fillAudioQueue(currentIdx - 1, 10).then(() => playFromQueue());
      } else {
        playVerse(prevVerseKey);
      }
    }
  };
  
  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };
  
  const handleRepeatToggle = () => {
    setAudioState(s => ({ ...s, isRepeating: !s.isRepeating }));
  };
  
  const handleVersePlayClick = (verse: Verse) => {
    const verseKey = `${surah.number}:${verse.number.inSurah}`;
    if (audioState.activeVerseKey === verseKey && audioState.isPlaying) {
      handlePlayPause();
    } else {
      playVerse(verseKey);
    }
  };

  const handleToggleContinuousPlay = () => {
    const isNowPlaying = !(isContinuousPlay && audioState.isPlaying);

    if (isNowPlaying) {
        setContinuousPlay(true);
        const wasPaused = isContinuousPlay && !audioState.isPlaying;

        if (wasPaused && audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {
              // If it fails, start fresh
              const startIdx = audioState.activeVerseKey ? surah.verses.findIndex(v => `${surah.number}:${v.number.inSurah}` === audioState.activeVerseKey) : 0;
              fillAudioQueue(startIdx, 10).then(() => playFromQueue());
            });
            setAudioState(s => ({ ...s, isPlaying: true }));
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioQueueRef.current = [];
            const startIdx = audioState.activeVerseKey ? surah.verses.findIndex(v => `${surah.number}:${v.number.inSurah}` === audioState.activeVerseKey) : 0;
            fillAudioQueue(startIdx, 10).then(() => {
                if (audioQueueRef.current.length > 0) {
                    playFromQueue();
                } else {
                    handlePlayerClose();
                }
            });
        }
    } else {
      audioRef.current?.pause();
      setAudioState(s => ({...s, isPlaying: false}));
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
  
  const activeVerse = getVerseByKey(audioState.activeVerseKey);
  const isSurahPlaying = isContinuousPlay && audioState.isPlaying;

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
              const isPlaying = audioState.activeVerseKey === verseKey && audioState.isPlaying;
              const isVerseActive = audioState.activeVerseKey === verseKey;
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
                const isPlaying = audioState.activeVerseKey === verseKey && audioState.isPlaying;
                const isVerseActive = audioState.activeVerseKey === verseKey;
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
        isOpen={audioState.showPlayer}
        isPlaying={audioState.isPlaying}
        surahName={isArabic ? surah.name : surah.englishName}
        verseNumber={activeVerse?.number.inSurah || 0}
        progress={audioState.progress}
        duration={audioState.duration}
        isRepeating={audioState.isRepeating}
        isContinuousPlay={isContinuousPlay}
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
    </div>
  );
}
