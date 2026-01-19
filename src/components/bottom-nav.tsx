'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Sparkles, Settings as SettingsIcon, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from './providers/settings-provider';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/quran', label: 'Quran', icon: BookOpen },
  { href: '/azkar', label: 'Azkar', icon: Sparkles },
  { href: '/tasbeeh', label: 'Tasbeeh', icon: Hand },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2">
      <div style={isClient ? { fontSize: `${settings.fontSize}px`} : {}} className="bg-background/70 backdrop-blur-xl border border-foreground/10 rounded-full p-2 flex justify-around items-center shadow-2xl shadow-black/20">
        {navItems.map((item) => {
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link href={item.href} key={item.label} className="relative z-10 flex-1 flex justify-center items-center h-14">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-1 transition-colors duration-300 rounded-full w-full h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-full transition-all duration-300',
                    isActive ? 'bg-primary/10 scale-100' : 'scale-0'
                  )}
                ></div>
                <item.icon className="w-5 h-5 z-10" />
                <span className="text-[10px] font-medium z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
