'use client';

import { WelcomeHeader } from '@/components/home/welcome-header';
import { NextPrayerCard } from '@/components/home/next-prayer-card';
import { LastReadCard } from '@/components/home/last-read-card';
import { DailyWisdomCard } from '@/components/home/daily-wisdom-card';
import { useAzanScheduler } from '@/hooks/use-azan-scheduler';
import { useLocation } from '@/hooks/use-location';
import { useLastRead } from '@/hooks/use-last-read';
import { useEffect } from 'react';

export default function Home() {
  useAzanScheduler();
  const { isLoading } = useLocation();
  const { refreshLastRead } = useLastRead();

  useEffect(() => {
    refreshLastRead();
  }, [refreshLastRead]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 animate-fade-in">
      <WelcomeHeader />
      <NextPrayerCard />
      <LastReadCard />
      <DailyWisdomCard />
    </div>
  );
}
