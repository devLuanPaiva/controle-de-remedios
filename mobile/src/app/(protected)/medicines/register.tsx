import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Camera as CameraIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useMedicineScan } from "@/data/contexts/MedicineScanContext";
import { useSpeechTips } from "@/data/hooks/useSpeechTips";
import { ApiRequestError } from "@/lib/apiFetch";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";
import { SpeechTipButton } from "@/components/shared/SpeechTipButton";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import { BackButton } from "@/components/shared/BackButton";

const BOX_TIPS = [
    "Fotografe a caixa inteira do medicamento, na vertical.",
    "Procure um ambiente bem iluminado antes de fotografar.",
    "Centralize a caixa dentro da moldura.",
    "Evite sombras e reflexos sobre a embalagem.",
];

export default function MedicineRegister() {
    const router = useRouter();
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [capturing, setCapturing] = useState(false);
    const hasSpokenWelcome = useRef(false);
    const hasInitializedName = useRef(false);

    const { lookup, boxPhoto, extractedName, isExtractingName, captureBoxPhoto, registerNewMedicine, reset } =
        useMedicineScan();
    const { isSpeaking, speakNextTip, stop: stopSpeech } = useSpeechTips(BOX_TIPS, { random: true });

    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            return () => {
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
    }

    async function handleSubmit() {
        if (!name.trim()) {
            setFormError("Informe o nome do medicamento.");
            return;
        }

        try {
            setFormError(null);
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
            setFormError(err instanceof ApiRequestError ? err.message : "Não foi possível cadastrar o medicamento.");
        } finally {
            setIsSubmitting(false);
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
                    Para fotografar a caixa do medicamento, o ChegaMed precisa da sua permissão de câmera.
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

    if (!boxPhoto) {
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

                    <View style={styles.bottomArea}>
                        <Text style={styles.hint}>Medicamento não encontrado. Fotografe a caixa para cadastrar.</Text>

                        <View style={styles.controlsRow}>
                            <CameraCaptureButton
                                disabled={capturing}
                                capturing={capturing}
                                onPress={handleCapture}
                                accessibilityLabel="Fotografar caixa do medicamento"
                            />
                        </View>
                    </View>
                </SafeAreaView>

                <ProcessingOverlay
                    visible={isExtractingName}
                    uploadLabel={null}
                    title="Analisando embalagem"
                    defaultUploadLabel="Identificando o nome do medicamento..."
                    secondaryLabel="Isso leva só um instante."
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.formContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <SafeAreaView style={styles.formContainer} edges={["top", "left", "right"]}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <BackButton onPress={handleRetake} />
                        <Text style={styles.title}>Cadastrar medicamento</Text>
                    </View>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <View style={styles.previewRow}>
                        <Image source={{ uri: boxPhoto.localUri }} style={styles.preview} contentFit="cover" />
                    </View>

                    {!isExtractingName && !extractedName ? (
                        <Text style={styles.warning}>
                            Não conseguimos identificar o nome automaticamente. Digite manualmente abaixo.
                        </Text>
                    ) : null}

                    <View style={styles.field}>
                        <Text style={styles.label}>Nome do medicamento</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: Dipirona 500mg"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {lookup.status === "not_found" ? (
                        <View style={styles.field}>
                            <Text style={styles.label}>Código de barras (EAN)</Text>
                            <Text style={styles.readOnlyValue}>{lookup.eanCode}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.submitButton, (!name.trim() || isSubmitting) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!name.trim() || isSubmitting}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar medicamento"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Cadastrar medicamento</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <ProcessingOverlay
                visible={isExtractingName}
                uploadLabel={null}
                title="Analisando embalagem"
                defaultUploadLabel="Identificando o nome do medicamento..."
                secondaryLabel="Isso leva só um instante."
            />
        </KeyboardAvoidingView>
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
        textAlign: "center",
        paddingHorizontal: Spacing.xl,
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

    formContainer: {
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

    previewRow: {
        alignItems: "center",
    },

    preview: {
        width: 160,
        height: 220,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surface,
    },

    warning: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.warning,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
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

    readOnlyValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        paddingVertical: Spacing.sm,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.danger}1A`,
        borderWidth: 1,
        borderColor: `${Colors.danger}40`,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
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
});
