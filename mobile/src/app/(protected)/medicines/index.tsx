import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Camera as CameraIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useMedicineScan } from "@/data/contexts/MedicineScanContext";
import { useSpeechTips } from "@/data/hooks/useSpeechTips";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";
import { SpeechTipButton } from "@/components/shared/SpeechTipButton";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import { BackButton } from "@/components/shared/BackButton";

const BARCODE_TIPS = [
    "Deite o celular na horizontal para ler o código de barras.",
    "Procure um ambiente bem iluminado antes de fotografar.",
    "Mantenha o código de barras próximo ao centro da tela.",
    "Evite reflexos na embalagem ao posicionar a câmera.",
];

export default function MedicineBarcodeScan() {
    const router = useRouter();
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [capturing, setCapturing] = useState(false);
    const hasSpokenWelcome = useRef(false);

    const { lookup, captureAndLookup } = useMedicineScan();
    const { isSpeaking, speakNextTip, stop: stopSpeech } = useSpeechTips(BARCODE_TIPS, { random: true });

    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

            return () => {
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                stopSpeech();
            };
        }, [stopSpeech]),
    );

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
                    Para fotografar o código de barras, o ChegaMed precisa da sua permissão de câmera.
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

    const isProcessing = lookup.status === "scanning" || lookup.status === "searching";

    return (
        <View style={styles.container}>
            {isFocused ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" /> : null}

            <LinearGradient colors={["rgba(0,0,0,0.55)", "transparent"]} style={styles.topGradient} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.bottomGradient} />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.topBar}>
                    <BackButton variant="onDark" />
                    <SpeechTipButton isSpeaking={isSpeaking} onPress={speakNextTip} />
                </View>

                <View style={styles.centerArea}>
                    <Text style={styles.hint}>Fotografe o código de barras da caixa do medicamento</Text>
                </View>

                <View style={styles.bottomArea}>
                    {lookup.status === "error" ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.white} />
                            <Text style={styles.errorText}>{lookup.message}</Text>
                        </View>
                    ) : null}

                    <View style={styles.controlsRow}>
                        <CameraCaptureButton
                            disabled={capturing || isProcessing}
                            capturing={capturing}
                            onPress={handleCapture}
                            accessibilityLabel="Fotografar código de barras"
                        />
                    </View>
                </View>
            </SafeAreaView>

            <ProcessingOverlay
                visible={isProcessing}
                uploadLabel={null}
                title="Identificando medicamento"
                defaultUploadLabel="Lendo código de barras..."
                secondaryLabel="Buscando medicamento cadastrado..."
            />
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
        height: 90,
    },

    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
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

    centerArea: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xxl,
    },

    hint: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
        textAlign: "center",
    },

    bottomArea: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
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
