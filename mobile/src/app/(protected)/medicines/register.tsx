import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView } from "expo-camera";

import { Colors, Spacing, Typography } from "@/theme";
import { useSpeechTips } from "@/data/hooks/useSpeechTips";
import { useAutoCameraPermission } from "@/features/medicines/hooks/useAutoCameraPermission";
import { useWelcomeTip } from "@/features/medicines/hooks/useWelcomeTip";
import { useMedicineRegisterForm } from "@/features/medicines/hooks/useMedicineRegisterForm";
import { CameraPermissionGate } from "@/features/medicines/components/CameraPermissionGate";
import { ScanTopBar } from "@/features/medicines/components/ScanTopBar";
import { CameraGradients } from "@/features/medicines/components/CameraGradients";
import { MedicineRegisterForm } from "@/features/medicines/components/MedicineRegisterForm";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";

const BOX_TIPS = [
    "Fotografe a caixa inteira do medicamento, na vertical.",
    "Procure um ambiente bem iluminado antes de fotografar.",
    "Centralize a caixa dentro da moldura.",
    "Evite sombras e reflexos sobre a embalagem.",
];

export default function MedicineRegister() {
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useAutoCameraPermission();
    const { isSpeaking, speakNextTip, stop: stopSpeech } = useSpeechTips(BOX_TIPS, { random: true });

    const {
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
        handleCapture,
        handleRetake,
        handleSubmit,
    } = useMedicineRegisterForm();

    useWelcomeTip(permission?.granted, speakNextTip);

    useFocusEffect(
        useCallback(() => {
            return () => {
                stopSpeech();
            };
        }, [stopSpeech]),
    );

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <CameraPermissionGate
                subtitle="Para fotografar a caixa do medicamento, o ChegaMed precisa da sua permissão de câmera."
                onRequestPermission={requestPermission}
            />
        );
    }

    if (!boxPhoto) {
        return (
            <View style={styles.container}>
                {isFocused ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" /> : null}

                <CameraGradients topHeight={140} bottomHeight={260} />

                <SafeAreaView style={styles.overlay}>
                    <ScanTopBar isSpeaking={isSpeaking} onSpeakPress={speakNextTip} />

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
        <MedicineRegisterForm
            boxPhoto={boxPhoto}
            extractedName={extractedName}
            isExtractingName={isExtractingName}
            lookup={lookup}
            name={name}
            onChangeName={setName}
            formError={formError}
            isSubmitting={isSubmitting}
            onRetake={handleRetake}
            onSubmit={handleSubmit}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
    },

    overlay: {
        flex: 1,
        justifyContent: "space-between",
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
});
