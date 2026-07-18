import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";

import { useMedicineScan } from "@/data/contexts/MedicineScanContext";
import { ApiRequestError } from "@/lib/apiFetch";

interface RetakenPhoto {
    localUri: string;
    base64: string;
}

export function useMedicineResultForm() {
    const router = useRouter();
    const { lookup, updateExistingMedicine, reset } = useMedicineScan();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [isRetakingPhoto, setIsRetakingPhoto] = useState(false);
    const [retakenPhoto, setRetakenPhoto] = useState<RetakenPhoto | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (lookup.status !== "found") {
            router.replace("/(protected)/medicines" as Href);
            return;
        }

        setName(lookup.medicine.name);
    }, [lookup, router]);

    function finishAndGoHome() {
        reset();
        router.replace("/(protected)/home" as Href);
    }

    function startEditingPhoto() {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }

        setIsRetakingPhoto(true);
    }

    async function handleRetakeCapture() {
        if (!cameraRef.current || capturing) {
            return;
        }

        try {
            setCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });

            if (photo?.uri && photo.base64) {
                setRetakenPhoto({ localUri: photo.uri, base64: photo.base64 });
                setIsRetakingPhoto(false);
            }
        } catch {
            Alert.alert("Erro", "Não foi possível capturar a foto. Tente novamente.");
        } finally {
            setCapturing(false);
        }
    }

    async function handleSave() {
        if (lookup.status !== "found") {
            return;
        }

        if (!name.trim()) {
            setFormError("Informe o nome do medicamento.");
            return;
        }

        try {
            setFormError(null);
            setIsSaving(true);

            await updateExistingMedicine(lookup.medicine.id, {
                name: name.trim() !== lookup.medicine.name ? name.trim() : undefined,
                newPhoto: retakenPhoto ?? undefined,
            });

            setIsEditing(false);
            setRetakenPhoto(null);
            Alert.alert("Sucesso", "Medicamento atualizado com sucesso.");
        } catch (err) {
            setFormError(err instanceof ApiRequestError ? err.message : "Não foi possível atualizar o medicamento.");
        } finally {
            setIsSaving(false);
        }
    }

    return {
        lookup,
        permission,
        cameraRef,
        isEditing,
        setIsEditing,
        name,
        setName,
        isRetakingPhoto,
        setIsRetakingPhoto,
        retakenPhoto,
        capturing,
        isSaving,
        formError,
        finishAndGoHome,
        startEditingPhoto,
        handleRetakeCapture,
        handleSave,
    };
}
