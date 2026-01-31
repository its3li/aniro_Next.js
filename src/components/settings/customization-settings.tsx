
'use client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '../providers/settings-provider';
import { Button } from '../ui/button';
import { Minus, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { calculationMethods, calculationMethodsArabic, CalculationMethodName } from '@/lib/prayer';

export function CustomizationSettings() {
  const { settings, setFontSize, setPrayerOffset, setQuranReciter, setCalculationMethod, setDstMode, setTimeFormat, setWidgetTheme, setWidgetBackgroundColor, setAppTheme, availableReciters } = useSettings();
  const isArabic = settings.language === 'ar';

  const handlePrayerOffsetChange = (change: number) => {
    const newOffset = settings.prayerOffset + change;
    if (newOffset >= -12 && newOffset <= 12) {
      setPrayerOffset(newOffset);
    }
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-xl font-bold font-headline">{isArabic ? 'تخصيص' : 'Customization'}</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="font-size-slider">{isArabic ? 'حجم الخط' : 'Font Size'}</Label>
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
            <Label htmlFor="prayer-offset">{isArabic ? 'تعديل مواقيت الصلاة (ساعات)' : 'Prayer Time Offset (Hours)'}</Label>
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
          <div className="space-y-2">
            <Label htmlFor="time-format">{isArabic ? 'تنسيق الوقت' : 'Time Format'}</Label>
            <Select value={settings.timeFormat} onValueChange={(val) => setTimeFormat(val as any)} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="time-format">
                <SelectValue placeholder={isArabic ? "اختر التنسيق" : "Select format"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">{isArabic ? '12 ساعة (ص/م)' : '12 Hours (AM/PM)'}</SelectItem>
                <SelectItem value="24h">{isArabic ? '24 ساعة' : '24 Hours'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dst-mode">{isArabic ? 'التوقيت الصيفي' : 'Daylight Saving Time'}</Label>
            <Select value={settings.dstMode} onValueChange={(val) => setDstMode(val as any)} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="dst-mode">
                <SelectValue placeholder={isArabic ? "اختر التوقيت" : "Select DST mode"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{isArabic ? 'تلقائي' : 'Auto'}</SelectItem>
                <SelectItem value="on">{isArabic ? 'توقيت صيفي (+1)' : 'Summer Time (+1)'}</SelectItem>
                <SelectItem value="off">{isArabic ? 'توقيت شتوي (Standard)' : 'Winter Time (Standard)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reciter-select">{isArabic ? 'القارئ' : 'Reciter'}</Label>
            <Select value={settings.quranReciter} onValueChange={setQuranReciter} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="reciter-select">
                <SelectValue placeholder={isArabic ? "اختر القارئ" : "Select a reciter"} />
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
          <div className="space-y-2">
            <Label htmlFor="calculation-method">{isArabic ? 'طريقة الحساب' : 'Calculation Method'}</Label>
            <Select value={settings.calculationMethod} onValueChange={(val) => setCalculationMethod(val as CalculationMethodName)} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="calculation-method">
                <SelectValue placeholder={isArabic ? "اختر طريقة الحساب" : "Select calculation method"} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(calculationMethods).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {isArabic ? calculationMethodsArabic[key as CalculationMethodName] : name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-theme">{isArabic ? 'مظهر التطبيق' : 'App Theme'}</Label>
            <Select value={settings.appTheme} onValueChange={(val) => setAppTheme(val as any)} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="app-theme">
                <SelectValue placeholder={isArabic ? "اختر المظهر" : "Select theme"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{isArabic ? 'النظام (تلقائي)' : 'System (Auto)'}</SelectItem>
                <SelectItem value="light">{isArabic ? 'فاتح' : 'Light'}</SelectItem>
                <SelectItem value="dark">{isArabic ? 'داكن' : 'Dark'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="widget-theme">{isArabic ? 'مظهر الويدجت' : 'Widget Theme'}</Label>
            <Select value={settings.widgetTheme} onValueChange={(val) => setWidgetTheme(val as any)} dir={isArabic ? 'rtl' : 'ltr'}>
              <SelectTrigger id="widget-theme">
                <SelectValue placeholder={isArabic ? "اختر المظهر" : "Select theme"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{isArabic ? 'افتراضي (ثيم التطبيق)' : 'Default (App Theme)'}</SelectItem>
                <SelectItem value="system">{isArabic ? 'لون النظام (Material You)' : 'System Color (Material You)'}</SelectItem>
                <SelectItem value="custom">{isArabic ? 'لون مخصص' : 'Custom Color'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.widgetTheme === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="widget-color">{isArabic ? 'لون الويدجت' : 'Widget Color'}</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <input
                    type="color"
                    id="widget-color"
                    value={settings.widgetBackgroundColor}
                    onChange={(e) => setWidgetBackgroundColor(e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                  />
                </div>
                <span className="font-mono text-sm">{settings.widgetBackgroundColor}</span>
              </div>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard >
  );
}
