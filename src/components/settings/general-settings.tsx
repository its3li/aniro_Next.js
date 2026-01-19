
'use client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '../providers/theme-provider';
import { useSettings } from '../providers/settings-provider';

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, setLanguage } = useSettings();
  const isArabic = settings.language === 'ar';

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-xl font-bold font-headline">{isArabic ? 'عام' : 'General'}</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="language-switch">{isArabic ? 'اللغة' : 'Language'}</Label>
            <div className='flex items-center gap-2 text-sm'>
              <span>English</span>
              <Switch
                id="language-switch"
                checked={settings.language === 'ar'}
                onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
              />
              <span>عربي</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch">{isArabic ? 'الوضع الداكن' : 'Dark Mode'}</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
