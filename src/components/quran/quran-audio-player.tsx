
'use client';

import { GlassCard } from '../glass-card';
import { Button } from '../ui/button';
import { Pause, Play, Repeat, SkipBack, SkipForward, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { useSettings } from '../providers/settings-provider';
import { cn } from '@/lib/utils';

interface QuranAudioPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  surahName: string;
  verseNumber: number;
  progress: number;
  duration: number;
  isRepeating: boolean;
  isContinuousPlay: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (value: number) => void;
  onRepeatToggle: () => void;
  onReciterChange: (reciter: string) => void;
  onClose: () => void;
}

export function QuranAudioPlayer({
  isOpen,
  isPlaying,
  surahName,
  verseNumber,
  progress,
  duration,
  isRepeating,
  isContinuousPlay,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onRepeatToggle,
  onReciterChange,
  onClose,
}: QuranAudioPlayerProps) {
  const { settings, availableReciters } = useSettings();
  const isArabic = settings.language === 'ar';

  if (!isOpen) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50 animate-fade-slide-in">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-headline">{surahName}</h3>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'الآية' : 'Verse'} {verseNumber}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-mono w-10 text-center">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 1}
            onValueChange={(value) => onSeek(value[0])}
            className='flex-1'
          />
          <span className="text-xs font-mono w-10 text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className='w-24'>
            <Select value={settings.quranReciter} onValueChange={onReciterChange}>
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
            <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full">
              <SkipBack />
            </Button>
            <Button size="icon" onClick={onPlayPause} className="w-12 h-12 rounded-full">
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full">
              <SkipForward />
            </Button>
          </div>

          <div className='w-24 flex justify-end'>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRepeatToggle}
              disabled={isContinuousPlay}
              className={cn(
                "rounded-full",
                isRepeating && !isContinuousPlay && 'text-primary bg-primary/10',
                isContinuousPlay && 'opacity-50 cursor-not-allowed'
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
