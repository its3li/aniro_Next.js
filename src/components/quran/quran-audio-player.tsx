
'use client';

import { GlassCard } from '../glass-card';
import { Button } from '../ui/button';
import { Pause, Play, Repeat, SkipBack, SkipForward, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { useSettings } from '../providers/settings-provider';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '../providers/audio-player-provider';

export function QuranAudioPlayer() {
  const {
    playerState,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleSeek,
    handleRepeatToggle,
    handlePlayerClose,
    getVerseByKey
  } = useAudioPlayer();

  const { settings, setQuranReciter, availableReciters } = useSettings();
  const isArabic = settings.language === 'ar';

  const {
    isPlaying,
    activeVerseKey,
    progress,
    duration,
    isRepeating,
    isContinuous,
    surah
  } = playerState;

  const activeVerse = getVerseByKey(activeVerseKey);
  const surahName = surah ? (isArabic ? surah.name : surah.englishName) : '';

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-fade-slide-in">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-headline">{surahName}</h3>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'الآية' : 'Verse'} {activeVerse?.number.inSurah || 0}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handlePlayerClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-mono w-10 text-center">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 1}
            onValueChange={(value) => handleSeek(value[0])}
            className='flex-1'
          />
          <span className="text-xs font-mono w-10 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className='w-24'>
            <Select value={settings.quranReciter} onValueChange={setQuranReciter}>
              <SelectTrigger className="w-auto bg-transparent border-none focus:ring-0 h-10 px-2">
                <SelectValue placeholder={isArabic ? 'القارئ' : 'Reciter'} />
              </SelectTrigger>
              <SelectContent>
                {availableReciters.map((reciter) => (
                  <SelectItem key={reciter.identifier} value={reciter.identifier}>
                    {isArabic ? reciter.name : reciter.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-full">
              <SkipBack />
            </Button>
            <Button size="icon" onClick={handlePlayPause} className="w-12 h-12 rounded-full">
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full">
              <SkipForward />
            </Button>
          </div>

          <div className='w-24 flex justify-end'>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRepeatToggle}
              disabled={isContinuous}
              className={cn(
                "rounded-full",
                isRepeating && !isContinuous && 'text-primary bg-primary/10',
                isContinuous && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Repeat />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
