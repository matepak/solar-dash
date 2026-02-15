/**
 * Notification sound module using the Web Audio API.
 *
 * Browsers block audio until the user interacts with the page (click, keypress, etc).
 * We create a shared AudioContext and unlock it on the first user gesture.
 * If a notification fires before any interaction, the sound is queued and plays
 * as soon as the user interacts.
 */

let audioContext: AudioContext | null = null;
let isUnlocked = false;
let pendingPlay = false;

/** Get or create the shared AudioContext */
const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

/** Play the two-tone chime */
const playChime = (ctx: AudioContext): void => {
    const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);

        // Fade in
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        // Fade out
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.15);     // D5
    playTone(880, now + 0.15, 0.25); // A5
};

/** Unlock the AudioContext and play any pending sound */
const unlockAudio = (): void => {
    if (isUnlocked) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
            isUnlocked = true;
            if (pendingPlay) {
                pendingPlay = false;
                playChime(ctx);
            }
        });
    } else {
        isUnlocked = true;
        if (pendingPlay) {
            pendingPlay = false;
            playChime(ctx);
        }
    }
};

// Listen for the first user interaction to unlock audio
if (typeof window !== 'undefined') {
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const onFirstInteraction = () => {
        unlockAudio();
        interactionEvents.forEach(evt =>
            document.removeEventListener(evt, onFirstInteraction)
        );
    };
    interactionEvents.forEach(evt =>
        document.addEventListener(evt, onFirstInteraction, { once: false })
    );
}

/**
 * Plays a notification chime.
 * If the AudioContext is still locked (no user interaction yet),
 * the sound is queued and plays on the next click/keypress.
 */
export const playNotificationSound = (): void => {
    try {
        const ctx = getAudioContext();

        if (ctx.state === 'suspended') {
            // Audio is locked — queue the sound for when the user interacts
            pendingPlay = true;
            // Try to resume (will succeed if there was a recent gesture)
            ctx.resume().then(() => {
                if (pendingPlay) {
                    pendingPlay = false;
                    playChime(ctx);
                }
            });
            return;
        }

        playChime(ctx);
    } catch (err) {
        console.warn('Could not play notification sound:', err);
    }
};
