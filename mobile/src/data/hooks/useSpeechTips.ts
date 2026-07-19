import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";

interface UseSpeechTipsOptions {
    random?: boolean;
}

interface UseSpeechTipsResult {
    isSpeaking: boolean;
    speakNextTip: () => void;
    stop: () => void;
}

function pickRandomIndex(length: number, lastIndex: number): number {
    const index = Math.floor(Math.random() * length);

    if (length > 1 && index === lastIndex) {
        return (index + 1) % length;
    }

    return index;
}

export function useSpeechTips(tips: string[], options?: UseSpeechTipsOptions): UseSpeechTipsResult {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const tipIndexRef = useRef(-1);
    const random = options?.random ?? false;

    const speakNextTip = useCallback(() => {
        Speech.stop();

        const nextIndex = random
            ? pickRandomIndex(tips.length, tipIndexRef.current)
            : (tipIndexRef.current + 1) % tips.length;

        tipIndexRef.current = nextIndex;
        const tip = tips[nextIndex];

        setIsSpeaking(true);
        Speech.speak(tip, {
            language: "pt-BR",
            pitch: 1.05,
            rate: 0.95,
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    }, [tips, random]);

    const stop = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    return { isSpeaking, speakNextTip, stop };
}
