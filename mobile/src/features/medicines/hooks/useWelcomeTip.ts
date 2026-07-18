import { useEffect, useRef } from "react";

export function useWelcomeTip(granted: boolean | undefined, speakNextTip: () => void) {
    const hasSpoken = useRef(false);

    useEffect(() => {
        if (granted && !hasSpoken.current) {
            hasSpoken.current = true;
            speakNextTip();
        }
    }, [granted, speakNextTip]);
}
