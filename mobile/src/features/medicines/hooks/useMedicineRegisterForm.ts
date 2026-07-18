import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CameraView } from "expo-camera";

import { useMedicineScan } from "@/data/contexts/MedicineScanContext";
import { ApiRequestError } from "@/lib/apiFetch";

export function useMedicineRegisterForm() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const [capturing, setCapturing] = useState(false);
    const hasInitializedName = useRef(false);

    const { lookup, boxPhoto, extractedName, isExtractingName, captureBoxPhoto, registerNewMedicine, reset } =
        useMedicineScan();

    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formErrorField, setFormErrorField] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (extractedName && !hasInitializedName.current) {
            hasInitializedName.current = true;
            setName(extractedName);
        }
    }, [extractedName]);

    useEffect(() => {
        if (lookup.status !== "not_found") {
            router.replace("/(protected)/medicines" as Href);
        }
    }, [lookup.status, router]);

    async function handleCapture() {
        if (!cameraRef.current || capturing) {
            return;
        }

        try {
            setCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });

            if (photo?.uri && photo.base64) {
                await captureBoxPhoto({ localUri: photo.uri, base64: photo.base64 });
            }
        } catch {
            Alert.alert("Erro", "Não foi possível capturar a foto. Tente novamente.");
        } finally {
            setCapturing(false);
        }
    }

    function handleRetake() {
        hasInitializedName.current = false;
        setName("");
        setFormError(null);
        setFormErrorField(undefined);
    }

    async function handleSubmit() {
        if (!name.trim()) {
            setFormError("Informe o nome do medicamento.");
            setFormErrorField("name");
            return;
        }

        try {
            setFormError(null);
            setFormErrorField(undefined);
            setIsSubmitting(true);

            await registerNewMedicine(name.trim());

            Alert.alert("Sucesso", "Medicamento cadastrado com sucesso.", [
                {
                    text: "OK",
                    onPress: () => {
                        reset();
                        router.replace("/(protected)/home" as Href);
                    },
                },
            ]);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setFormErrorField(err.field);
            } else {
                setFormError("Não foi possível cadastrar o medicamento.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        cameraRef,
        capturing,
        lookup,
        boxPhoto,
        extractedName,
        isExtractingName,
        name,
        setName,
        isSubmitting,
        formError,
        formErrorField,
        handleCapture,
        handleRetake,
        handleSubmit,
    };
}
