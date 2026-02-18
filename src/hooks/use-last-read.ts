
import { useState, useEffect, useCallback } from 'react';

export interface LastReadState {
    surahName: string;
    surahNameAr: string;
    surahNumber: number;
    verseNumber: number;
    pageNumber: number;
    juzNumber: number;
    hizbNumber: number;
    timestamp: number;
}

const STORAGE_KEY = 'quran_last_read';

export function useLastRead() {
    const [lastRead, setLastRead] = useState<LastReadState | null>(null);

    const loadFromStorage = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setLastRead(JSON.parse(stored));
            } else {
                setLastRead(null);
            }
        } catch (error) {
            console.error('Failed to load last read', error);
        }
    }, []);

    useEffect(() => {
        loadFromStorage();
        
        const handleFocus = () => loadFromStorage();
        window.addEventListener('focus', handleFocus);
        
        return () => window.removeEventListener('focus', handleFocus);
    }, [loadFromStorage]);

    const saveLastRead = (state: LastReadState) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setLastRead(state);
        } catch (error) {
            console.error('Failed to save last read', error);
        }
    };

    return { lastRead, saveLastRead, refreshLastRead: loadFromStorage };
}
