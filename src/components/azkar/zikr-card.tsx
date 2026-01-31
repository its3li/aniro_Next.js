'use client';

import { useState, useEffect } from 'react';
import type { AzkarItem } from "@/lib/azkar";
import { GlassCard, GlassCardContent } from "../glass-card";
import { Button } from '../ui/button';
import { Check, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '../providers/settings-provider';

interface ZikrCardProps {
  item: AzkarItem;
}

export function ZikrCard({ item }: ZikrCardProps) {
  const { settings } = useSettings();
  const [count, setCount] = useState(item.repetitions || 0);

  useEffect(() => {
    setCount(item.repetitions || 0);
  }, [item]);

  const handleTap = () => {
    if (count > 0) {
      setCount(c => c - 1);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(item.repetitions || 0);
  };

  const hasCounter = item.repetitions && item.repetitions > 1;
  const isCompleted = hasCounter && count === 0;

  return (
    <GlassCard
      onClick={hasCounter ? handleTap : undefined}
      className={cn(
        'transition-all',
        hasCounter && 'cursor-pointer active:scale-[0.98]',
        isCompleted && 'bg-primary/10 border-primary/20'
      )}
    >
      <GlassCardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <p className="text-2xl leading-relaxed text-right font-quran">{item.arabic}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.translation}</p>

          {item.repetitions && !hasCounter && (
            <div className="text-center">
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                {settings.language === 'ar'
                  ? `كرر ${item.repetitions} ${item.repetitions > 10 ? 'مرة' : 'مرات'}`
                  : `Recite ${item.repetitions} time${item.repetitions > 1 ? 's' : ''}`
                }
              </span>
            </div>
          )}

          {hasCounter && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button variant="ghost" size="icon" onClick={handleReset} className="text-muted-foreground" aria-label="Reset count">
                <Repeat className='w-5 h-5' />
              </Button>
              <div
                className={cn(
                  "relative w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold font-mono transition-colors",
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}
              >
                {isCompleted ? <Check className="w-8 h-8" /> : count}
              </div>
              {/* This div is for spacing to keep the counter centered */}
              <div className="w-10 h-10"></div>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
