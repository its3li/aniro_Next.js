'use client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '../providers/theme-provider';

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <GlassCard>
      <GlassCardHeader>
        <h2 className="text-xl font-bold font-headline">General</h2>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="language-switch">Language</Label>
            <div className='flex items-center gap-2 text-sm'>
              <span>English</span>
              <Switch id="language-switch" disabled />
              <span>عربي</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch">Dark Mode</Label>
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
