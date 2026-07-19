import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CameraView } from "expo-camera";

import { useMedicineScan } from "@/data/contexts/MedicineScanContext";

export function useBarcodeCapture() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const [capturing, setCapturing] = useState(false);
    const { lookup, captureAndLookup } = useMedicineScan();

    async function handleCapture() {
        if (!cameraRef.current || capturing) {
            return;
        }

        try {
            setCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });

            if (!photo?.uri || !photo.base64) {
                return;
            }

            const result = await captureAndLookup({ localUri: photo.uri, base64: photo.base64 });

            if (result.status === "found") {
                router.push("/(protected)/medicines/result" as Href);
            } else if (result.status === "not_found") {
                router.push("/(protected)/medicines/register" as Href);
            } else if (result.status === "error") {
                Alert.alert("Erro", result.message);
            }
        } catch {
            Alert.alert("Erro", "Não foi possível capturar a foto. Tente novamente.");
        } finally {
            setCapturing(false);
        }
    }

    return { cameraRef, capturing, lookup, handleCapture };
}
