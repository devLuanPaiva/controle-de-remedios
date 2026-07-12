import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";

const TIPS = [
    "Aproxime a câmera da receita e mantenha o celular parado.",
    "Procure um ambiente bem iluminado antes de fotografar.",
    "Limpe a lente da câmera para uma foto mais nítida.",
    "Evite sombras e reflexos sobre o papel.",
    "Centralize a receita inteira dentro da moldura.",
];

interface UseSpeechTipsResult {
    isSpeaking: boolean;
    speakNextTip: () => void;
}

export function useSpeechTips(): UseSpeechTipsResult {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const tipIndexRef = useRef(0);

    const speakNextTip = useCallback(() => {
        Speech.stop();

        const tip = TIPS[tipIndexRef.current % TIPS.length];
        tipIndexRef.current += 1;

        setIsSpeaking(true);
        Speech.speak(tip, {
            language: "pt-BR",
            pitch: 1.05,
            rate: 0.95,
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    }, []);

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    return { isSpeaking, speakNextTip };
}
