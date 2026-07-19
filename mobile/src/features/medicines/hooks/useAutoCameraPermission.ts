import { useEffect } from "react";
import { useCameraPermissions } from "expo-camera";

export function useAutoCameraPermission() {
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    return [permission, requestPermission] as const;
}
