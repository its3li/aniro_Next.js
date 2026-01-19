
'use client';
import { useState, useEffect } from 'react';
import type { Surah, Verse } from '@/lib/quran';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, List, Play, Pause, Copy } from 'lucide-react';
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
import { ReciterSelectModal } from './reciter-select-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuranReaderProps {
  surah: Surah;
  onBack: () => void;
}

export function QuranReader({ surah, onBack }: QuranReaderProps) {
  const { settings, setQuranViewMode, setQuranEdition, setQuranReciter } = useSettings();
  const { quranViewMode, language, quranEdition, quranReciter } = settings;
  const isArabic = language === 'ar';
  const { toast } = useToast();

  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isTafseerOpen, setTafseerOpen] = useState(false);

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [isReciterModalOpen, setReciterModalOpen] = useState(false);
  const [verseToPlay, setVerseToPlay] = useState<Verse | null>(null);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  useEffect(() => {
    if (verseToPlay && quranReciter) {
      playAudio(verseToPlay);
      setVerseToPlay(null);
    }
  }, [quranReciter, verseToPlay]);

  const playAudio = (verse: Verse) => {
    if (playingVerse === verse.number.inQuran) {
      audio?.pause();
      setPlayingVerse(null);
      return;
    }

    audio?.pause();
    const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/${quranReciter}/${verse.number.inQuran}.mp3`);
    setAudio(newAudio);
    setPlayingVerse(verse.number.inQuran);
    newAudio.play().catch(err => {
      console.error("Audio play failed:", err);
      toast({
        variant: "destructive",
        title: isArabic ? "خطأ في تشغيل الصوت" : "Error playing audio",
        description: isArabic ? "تعذر تشغيل ملف الصوت." : "Could not play the audio file.",
      });
      setPlayingVerse(null);
    });
    newAudio.onended = () => setPlayingVerse(null);
  };
  
  const handlePlayClick = (verse: Verse) => {
    if (!quranReciter) {
      setVerseToPlay(verse);
      setReciterModalOpen(true);
    } else {
      playAudio(verse);
    }
  };

  const handleReciterSelected = (identifier: string) => {
    setQuranReciter(identifier);
    setReciterModalOpen(false);
  };

  const handleCopy = (verse: Verse) => {
    const pureText = stripTajweed(verse.text);
    const textToCopy = `${pureText} (${isArabic ? surah.name : surah.englishName}:${verse.number.inSurah})`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: isArabic ? 'تم نسخ الآية' : 'Verse copied to clipboard' });
  };

  const handleLongPress = (verse: Verse) => {
    setSelectedVerse(verse);
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
            <h1 className="text-xl font-bold font-headline">{isArabic ? surah.name : surah.englishName}</h1>
            <p className="text-muted-foreground font-quran text-2xl">{isArabic ? surah.englishName : surah.name}</p>
          </div>
          <div className="w-10"></div>
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
            {surah.verses.map((verse) => (
              <div
                key={verse.number.inQuran}
                onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }}
                className="bg-foreground/5 p-4 rounded-2xl cursor-pointer flex items-start gap-4"
              >
                <Button variant="ghost" size="icon" className="mt-2" onClick={() => handlePlayClick(verse)}>
                  {playingVerse === verse.number.inQuran ? <Pause /> : <Play />}
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
            ))}
          </div>
        ) : (
          <div className="bg-foreground/5 p-6 rounded-2xl">
            <p className="font-quran text-3xl leading-loose text-right">
              {surah.verses.map(verse => (
                <span key={verse.number.inQuran} onContextMenu={(e) => { e.preventDefault(); handleLongPress(verse); }} className="relative group">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1 p-1 rounded-full bg-background/80 backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                     dir="ltr"
                   >
                      <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => handlePlayClick(verse)}>
                          {playingVerse === verse.number.inQuran ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => handleCopy(verse)}>
                          <Copy className="h-5 w-5" />
                      </Button>
                  </div>
                   {quranEdition === 'tajweed' ? (
                    <span className={cn(playingVerse === verse.number.inQuran ? "text-primary" : "")} dangerouslySetInnerHTML={{ __html: parseTajweed(verse.text) }} />
                  ) : (
                    <span className={cn(playingVerse === verse.number.inQuran ? "text-primary" : "")}>{verse.text}</span>
                  )}
                  <span className="text-primary font-sans text-xl mx-2">
                    ({verse.number.inSurah})
                  </span>
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <ReciterSelectModal 
        isOpen={isReciterModalOpen}
        onClose={() => setReciterModalOpen(false)}
        onSelect={handleReciterSelected}
      />
      {selectedVerse && (
        <TafseerModal 
          verse={selectedVerse} 
          surahName={isArabic ? surah.name : surah.englishName}
          surahNumber={surah.number}
          isOpen={isTafseerOpen} 
          onClose={() => setTafseerOpen(false)} 
        />
      )}
    </div>
  );
}
