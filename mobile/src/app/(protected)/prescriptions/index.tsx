import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Camera as CameraIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { usePrescriptionScan } from "@/data/contexts/PrescriptionScanContext";
import { createLocalId } from "@/lib/createLocalId";
import { useSpeechTips } from "@/features/prescriptions/hooks/useSpeechTips";
import { PrescriptionTypeSelector } from "@/features/prescriptions/components/PrescriptionTypeSelector";
import { CameraCaptureButton } from "@/features/prescriptions/components/CameraCaptureButton";
import { CapturedPagesStrip } from "@/features/prescriptions/components/CapturedPagesStrip";
import { SpeechTipButton } from "@/features/prescriptions/components/SpeechTipButton";
import { ProcessingOverlay } from "@/features/prescriptions/components/ProcessingOverlay";

export default function PrescriptionScan() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [capturing, setCapturing] = useState(false);
    const hasSpokenWelcome = useRef(false);

    const {
        prescriptionType,
        pages,
        isProcessing,
        uploadProgressLabel,
        processError,
        setPrescriptionType,
        addPage,
        removePage,
        processAndContinue,
    } = usePrescriptionScan();

    const { isSpeaking, speakNextTip } = useSpeechTips();

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useEffect(() => {
        if (permission?.granted && !hasSpokenWelcome.current) {
            hasSpokenWelcome.current = true;
            speakNextTip();
        }
    }, [permission?.granted, speakNextTip]);

    async function handleCapture() {
        if (!cameraRef.current || capturing) {
            return;
        }

        try {
            setCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });

            if (photo?.uri && photo.base64) {
                addPage({ id: createLocalId("page"), localUri: photo.uri, base64: photo.base64 });
            }
        } catch {
            Alert.alert("Erro", "Não foi possível capturar a foto. Tente novamente.");
        } finally {
            setCapturing(false);
        }
    }

    async function handleSubmit() {
        const success = await processAndContinue();

        if (success) {
            router.push("/(protected)/prescriptions/review" as Href);
        }
    }

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <View style={styles.permissionIconBadge}>
                    <CameraIcon size={32} color={Colors.primary} />
                </View>
                <Text style={styles.permissionTitle}>Acesso à câmera necessário</Text>
                <Text style={styles.permissionSubtitle}>
                    Para fotografar a receita médica, o ChegaMed precisa da sua permissão de câmera.
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Permitir acesso à câmera"
                >
                    <Text style={styles.permissionButtonText}>Permitir acesso</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const canCapture = Boolean(prescriptionType) && !capturing && !isProcessing;
    const canSubmit = pages.length > 0 && !isProcessing;

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

            <LinearGradient colors={["rgba(0,0,0,0.55)", "transparent"]} style={styles.topGradient} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.bottomGradient} />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.topBar}>
                    <PrescriptionTypeSelector
                        value={prescriptionType}
                        onChange={setPrescriptionType}
                        disabled={pages.length > 0}
                    />
                    <SpeechTipButton isSpeaking={isSpeaking} onPress={speakNextTip} />
                </View>

                <View style={styles.bottomArea}>
                    {processError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.white} />
                            <Text style={styles.errorText}>{processError}</Text>
                        </View>
                    ) : null}

                    {!prescriptionType ? (
                        <Text style={styles.hint}>Selecione o tipo de receita para começar.</Text>
                    ) : null}

                    <CapturedPagesStrip pages={pages} onRemove={removePage} />

                    <View style={styles.controlsRow}>
                        <View style={styles.controlsSide} />

                        <CameraCaptureButton disabled={!canCapture} capturing={capturing} onPress={handleCapture} />

                        <View style={styles.controlsSide}>
                            <TouchableOpacity
                                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={!canSubmit}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel="Enviar receituário"
                            >
                                <Text style={styles.submitButtonText}>Enviar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <ProcessingOverlay visible={isProcessing} uploadLabel={uploadProgressLabel} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
    },

    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 140,
    },

    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 260,
    },

    overlay: {
        flex: 1,
        justifyContent: "space-between",
    },

    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    bottomArea: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    hint: {
        alignSelf: "center",
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginHorizontal: Spacing.xl,
        backgroundColor: "rgba(220,38,38,0.92)",
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.xl,
    },

    controlsSide: {
        width: 92,
        alignItems: "center",
    },

    submitButton: {
        backgroundColor: Colors.white,
        borderRadius: Radius.full,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        ...Shadows.md,
    },

    submitButtonDisabled: {
        opacity: 0.5,
    },

    submitButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },

    permissionContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.md,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },

    permissionIconBadge: {
        width: 72,
        height: 72,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },

    permissionTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        textAlign: "center",
    },

    permissionSubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },

    permissionButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.md,
        ...Shadows.md,
    },

    permissionButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
    },
});
