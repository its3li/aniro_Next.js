'use client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/use-location';
import { useTheme } from '../providers/theme-provider';
import { useSettings } from '../providers/settings-provider';
import { cn } from '@/lib/utils';

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, setLanguage } = useSettings();
  const { city, country, refreshLocation, isLoading } = useLocation();
  const isArabic = settings.language === 'ar';

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-xl font-bold font-headline">{isArabic ? 'عام' : 'General'}</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg">
            <Label htmlFor="language-switch" className="font-medium">{isArabic ? 'اللغة' : 'Language'}</Label>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm font-medium", settings.language === 'en' ? 'text-primary' : 'text-muted-foreground')}>
                English
              </span>
              <Switch
                id="language-switch"
                checked={settings.language === 'ar'}
                onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
                dir="ltr"
              />
              <span className={cn("text-sm font-medium", settings.language === 'ar' ? 'text-primary' : 'text-muted-foreground')}>
                عربي
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg">
            <Label htmlFor="dark-mode-switch" className="font-medium">{isArabic ? 'الوضع الداكن' : 'Dark Mode'}</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg">
            <div className="flex flex-col gap-1">
              <Label className="font-medium">{isArabic ? 'الموقع الحالي' : 'Current Location'}</Label>
              <p className="text-xs text-muted-foreground">
                {city || (isArabic ? 'جار تحديد الموقع...' : 'Detecting location...')}
                {country ? `, ${country}` : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshLocation()}
              disabled={isLoading}
            >
              {isLoading ? (isArabic ? 'جاري التحديث...' : 'Updating...') : (isArabic ? 'تحديث' : 'Refresh')}
            </Button>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
