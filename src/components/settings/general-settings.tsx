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
        <h2 className="text-base font-semibold">{isArabic ? 'عام' : 'General'}</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <Label htmlFor="language-switch" className="text-sm">{isArabic ? 'اللغة' : 'Language'}</Label>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs", settings.language === 'en' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                EN
              </span>
              <Switch
                id="language-switch"
                checked={settings.language === 'ar'}
                onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
                dir="ltr"
              />
              <span className={cn("text-xs", settings.language === 'ar' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                عربي
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <Label htmlFor="dark-mode-switch" className="text-sm">{isArabic ? 'الوضع الداكن' : 'Dark Mode'}</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              dir="ltr"
            />
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm">{isArabic ? 'الموقع الحالي' : 'Current Location'}</Label>
              <p className="text-[11px] text-muted-foreground">
                {city || (isArabic ? 'جار تحديد الموقع...' : 'Detecting location...')}
                {country ? `, ${country}` : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-lg"
              onClick={() => refreshLocation()}
              disabled={isLoading}
            >
              {isLoading ? (isArabic ? 'جاري...' : 'Updating...') : (isArabic ? 'تحديث' : 'Refresh')}
            </Button>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
