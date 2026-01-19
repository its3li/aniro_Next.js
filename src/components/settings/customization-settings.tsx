'use client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '../providers/settings-provider';
import { Button } from '../ui/button';
import { Minus, Plus } from 'lucide-react';

export function CustomizationSettings() {
  const { settings, setFontSize, setPrayerOffset } = useSettings();

  const handlePrayerOffsetChange = (change: number) => {
    const newOffset = settings.prayerOffset + change;
    if (newOffset >= -12 && newOffset <= 12) {
      setPrayerOffset(newOffset);
    }
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-xl font-bold font-headline">Customization</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="font-size-slider">Font Size</Label>
            <div className='flex items-center gap-4'>
                <span className='text-sm'>A</span>
                <Slider
                    id="font-size-slider"
                    min={12}
                    max={20}
                    step={1}
                    value={[settings.fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                />
                <span className='text-xl'>A</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prayer-offset">Prayer Time Offset (Hours)</Label>
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" onClick={() => handlePrayerOffsetChange(-1)}>
                    <Minus />
                </Button>
                <span className="text-xl font-bold font-mono w-12 text-center">{settings.prayerOffset > 0 ? `+${settings.prayerOffset}` : settings.prayerOffset}</span>
                <Button variant="outline" size="icon" onClick={() => handlePrayerOffsetChange(1)}>
                    <Plus />
                </Button>
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
