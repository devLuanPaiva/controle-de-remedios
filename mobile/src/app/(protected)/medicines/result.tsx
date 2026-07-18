import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { CheckCircle2, Pencil } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useMedicineScan } from "@/data/contexts/MedicineScanContext";
import { ApiRequestError } from "@/lib/apiFetch";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";
import { BackButton } from "@/components/shared/BackButton";

interface RetakenPhoto {
    localUri: string;
    base64: string;
}

export default function MedicineFoundResult() {
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

    if (lookup.status !== "found") {
        return <View style={styles.container} />;
    }

    const { medicine } = lookup;
    const hasChanges = name.trim() !== medicine.name || Boolean(retakenPhoto);
    const previewUri = retakenPhoto?.localUri ?? medicine.imageUrl ?? undefined;

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
        if (!name.trim()) {
            setFormError("Informe o nome do medicamento.");
            return;
        }

        try {
            setFormError(null);
            setIsSaving(true);

            await updateExistingMedicine(medicine.id, {
                name: name.trim() !== medicine.name ? name.trim() : undefined,
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

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <BackButton onPress={finishAndGoHome} />
                    <Text style={styles.title}>Medicamento encontrado</Text>
                </View>

                <View style={styles.badge}>
                    <CheckCircle2 size={16} color={Colors.success} />
                    <Text style={styles.badgeText}>Já cadastrado</Text>
                </View>

                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                <View style={styles.previewRow}>
                    <View style={styles.previewWrapper}>
                        {previewUri ? (
                            <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
                        ) : (
                            <View style={[styles.preview, styles.previewPlaceholder]} />
                        )}

                        {isEditing ? (
                            <TouchableOpacity
                                style={styles.changePhotoButton}
                                onPress={startEditingPhoto}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Trocar foto do medicamento"
                            >
                                <Text style={styles.changePhotoText}>Trocar foto</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Nome do medicamento</Text>
                    {isEditing ? (
                        <TextInput style={styles.input} value={name} onChangeText={setName} />
                    ) : (
                        <Text style={styles.value}>{medicine.name}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Código de barras (EAN)</Text>
                    <Text style={styles.readOnlyValue}>{medicine.eanCode ?? lookup.eanCode}</Text>
                </View>

                {isEditing ? (
                    <TouchableOpacity
                        style={[styles.submitButton, (!hasChanges || isSaving) && styles.submitButtonDisabled]}
                        onPress={handleSave}
                        disabled={!hasChanges || isSaving}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Salvar alterações"
                    >
                        {isSaving ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Salvar alterações</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Editar nome ou imagem"
                        >
                            <Pencil size={16} color={Colors.primary} />
                            <Text style={styles.editButtonText}>Editar nome ou imagem</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={finishAndGoHome}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Concluído"
                        >
                            <Text style={styles.submitButtonText}>Concluído</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <Modal visible={isRetakingPhoto} animationType="slide">
                <View style={styles.cameraContainer}>
                    {isRetakingPhoto && permission?.granted ? (
                        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
                    ) : null}

                    <SafeAreaView style={styles.cameraOverlay}>
                        <View style={styles.cameraTopBar}>
                            <BackButton variant="onDark" onPress={() => setIsRetakingPhoto(false)} />
                        </View>

                        <View style={styles.centerArea}>
                            <Text style={styles.cameraHint}>Fotografe a caixa do medicamento</Text>
                        </View>

                        <View style={styles.cameraControlsRow}>
                            <CameraCaptureButton
                                disabled={capturing || !permission?.granted}
                                capturing={capturing}
                                onPress={handleRetakeCapture}
                                accessibilityLabel="Fotografar nova imagem do medicamento"
                            />
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
        gap: Spacing.lg,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    badge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: Spacing.xs,
        backgroundColor: `${Colors.success}1A`,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    badgeText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.success,
    },

    previewRow: {
        alignItems: "center",
    },

    previewWrapper: {
        width: 160,
        height: 220,
    },

    preview: {
        width: 160,
        height: 220,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surface,
    },

    previewPlaceholder: {
        borderWidth: 1,
        borderColor: Colors.border,
    },

    changePhotoButton: {
        position: "absolute",
        right: Spacing.md,
        bottom: Spacing.md,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },

    changePhotoText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    value: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: Spacing.sm,
    },

    readOnlyValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        paddingVertical: Spacing.sm,
    },

    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: Radius.full,
        height: 48,
    },

    editButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.sm,
        ...Shadows.md,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },

    cameraContainer: {
        flex: 1,
        backgroundColor: Colors.dark,
    },

    cameraOverlay: {
        flex: 1,
        justifyContent: "space-between",
    },

    cameraTopBar: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    centerArea: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xxl,
    },

    cameraHint: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
        textAlign: "center",
    },

    cameraControlsRow: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
});
