
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

  useEffect(() => {
    playerStateRef.current = { isContinuousPlay, isRepeating: audioState.isRepeating };
  }, [isContinuousPlay, audioState.isRepeating]);

  const getVerseByKey = (key: string | null): Verse | undefined => {
    if (!key) return undefined;
    const verseNum = parseInt(key.split(':')[1]);
    return surah.verses.find(v => v.number.inSurah === verseNum);
  };
  
  const handlePlayerClose = useCallback(() => {
    audioRef.current?.pause();
    setAudioState({
      isPlaying: false,
      activeVerseKey: null,
      showPlayer: false,
      progress: 0,
      duration: 0,
      isRepeating: false,
    });
    setContinuousPlay(false);
  }, []);

  const handleNext = useCallback(() => {
    const currentVerse = getVerseByKey(audioState.activeVerseKey);
    if (!currentVerse) return;
    const currentIdx = surah.verses.findIndex(v => v.number.inSurah === currentVerse.number.inSurah);
    if (currentIdx < surah.verses.length - 1) {
      const nextVerse = surah.verses[currentIdx + 1];
      playVerse(`${surah.number}:${nextVerse.number.inSurah}`);
    } else {
      setContinuousPlay(false);
      handlePlayerClose();
    }
  }, [audioState.activeVerseKey, surah.number, surah.verses, handlePlayerClose]); // playVerse removed

  const playVerse = useCallback(async (verseKey: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const verse = getVerseByKey(verseKey);
    if (!verse) {
      handlePlayerClose();
      return;
    }
    
    setAudioState(s => ({ ...s, isPlaying: true, activeVerseKey: verseKey, showPlayer: true, progress: 0, duration: 0 }));
    const verseElement = verseRefs.current.get(verseKey);
    verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verse.number.inQuran}/${quranReciter}`);
      if (!response.ok) throw new Error('Failed to fetch audio data.');
      const result = await response.json();
      if (result.code !== 200 || !result.data.audio) throw new Error('Invalid audio data from API.');
      
      const audioUrl = result.data.audio;
      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;

      newAudio.onloadedmetadata = () => setAudioState(s => ({ ...s, duration: newAudio.duration }));
      newAudio.ontimeupdate = () => {
        if (newAudio.duration > 0) {
          setAudioState(s => ({ ...s, progress: newAudio.currentTime }));
        }
      };
      newAudio.onended = () => {
        const { isRepeating, isContinuousPlay } = playerStateRef.current;
        if (isRepeating) {
          newAudio.currentTime = 0;
          newAudio.play();
        } else if (isContinuousPlay) {
          handleNext();
        } else {
          setAudioState(s => ({ ...s, isPlaying: false, progress: 0 }));
        }
      };
      newAudio.onerror = () => {
        toast({
          variant: "destructive",
          title: isArabic ? "خطأ في تشغيل الصوت" : "Error playing audio",
          description: isArabic ? `تعذر تشغيل ملف الصوت للقارئ ${quranReciter}.` : `Could not play audio for ${quranReciter}.`,
        });
        setAudioState(s => ({ ...s, isPlaying: false }));
      };
      
      await newAudio.play();

    } catch (error) {
      console.error("Failed to fetch and play verse:", error);
      toast({
        variant: "destructive",
        title: isArabic ? "خطأ في جلب الصوت" : "Error fetching audio",
        description: error instanceof Error ? error.message : (isArabic ? "الرجاء التحقق من اتصالك بالإنترنت." : "Please check your internet connection."),
      });
      handlePlayerClose();
    }

  }, [quranReciter, isArabic, toast, handleNext, handlePlayerClose]);


  useEffect(() => {
    // This effect handles reciter changes during playback
    if (audioState.isPlaying && audioState.activeVerseKey) {
      playVerse(audioState.activeVerseKey);
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
    } else if (audioState.activeVerseKey) {
      audioRef.current?.play().catch(() => {
        playVerse(audioState.activeVerseKey!);
      });
      setAudioState(s => ({ ...s, isPlaying: true }));
    }
  };

  const handlePrev = () => {
    const currentVerse = getVerseByKey(audioState.activeVerseKey);
    if (!currentVerse) return;
    const currentIdx = surah.verses.findIndex(v => v.number.inSurah === currentVerse.number.inSurah);
    if (currentIdx > 0) {
      const prevVerse = surah.verses[currentIdx - 1];
      playVerse(`${surah.number}:${prevVerse.number.inSurah}`);
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
    setContinuousPlay(false);
    const verseKey = `${surah.number}:${verse.number.inSurah}`;
    if (audioState.activeVerseKey === verseKey && audioState.isPlaying) {
      handlePlayPause();
    } else {
      playVerse(verseKey);
    }
  };

  const handleToggleContinuousPlay = () => {
    const isNowPlaying = !(isContinuousPlay && audioState.isPlaying);

    setContinuousPlay(true);
    
    if (isNowPlaying) {
      let verseToPlayKey = audioState.activeVerseKey;
      if (!verseToPlayKey) {
          const firstVerse = surah.verses[0];
          if(firstVerse) verseToPlayKey = `${surah.number}:${firstVerse.number.inSurah}`;
      }

      if (verseToPlayKey) {
         if (audioRef.current && audioState.activeVerseKey === verseToPlayKey && !audioState.isPlaying) {
            audioRef.current.play();
            setAudioState(s => ({ ...s, isPlaying: true }));
         } else {
            playVerse(verseToPlayKey);
         }
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
