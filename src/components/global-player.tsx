
'use client';
import { useAudioPlayer } from './providers/audio-player-provider';
import { QuranAudioPlayer } from './quran/quran-audio-player';
import { BottomNav } from './bottom-nav';
import { ReciterSelectModal } from './quran/reciter-select-modal';
import { useSettings } from './providers/settings-provider';

export function GlobalPlayer() {
    const { playerState, isReciterModalOpen, setReciterModalOpen, pendingActionRef } = useAudioPlayer();
    const { setQuranReciter } = useSettings();

    const handleReciterSelect = (identifier: string) => {
        setQuranReciter(identifier);
        localStorage.setItem('hasSetReciter', 'true');
        setReciterModalOpen(false);
        if (pendingActionRef.current) {
            pendingActionRef.current();
            pendingActionRef.current = null;
        }
    }

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
                {playerState.showPlayer ? <QuranAudioPlayer /> : <BottomNav />}
            </div>
            <ReciterSelectModal 
                isOpen={isReciterModalOpen}
                onClose={() => {
                  setReciterModalOpen(false);
                  pendingActionRef.current = null;
                }}
                onSelect={handleReciterSelect}
            />
        </>
    )
}
