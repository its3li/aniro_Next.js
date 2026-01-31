'use client';

import { DailyWisdomCard } from '@/components/home/daily-wisdom-card';
import { NextPrayerCard } from '@/components/home/next-prayer-card';
import { WelcomeHeader } from '@/components/home/welcome-header';
import { useAzanScheduler } from '@/hooks/use-azan-scheduler';
import { useLocation } from '@/hooks/use-location';
export default function Home() {
  useAzanScheduler();
  // Location loading is now handled globally or silently
  const { isLoading } = useLocation();

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 animate-fade-slide-in">
      <WelcomeHeader />
      <NextPrayerCard />
      <DailyWisdomCard />
    </div>
  );
}
