
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

        // Delay execution to allow state to update first
        if (pendingActionRef.current) {
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            setTimeout(() => {
                action();
            }, 100);
        }
    }

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50">
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
