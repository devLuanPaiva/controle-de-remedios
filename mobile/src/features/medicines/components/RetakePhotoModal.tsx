import { Ref } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";

import { Colors, Spacing, Typography } from "@/theme";
import { BackButton } from "@/components/shared/BackButton";
import { CameraCaptureButton } from "@/components/shared/CameraCaptureButton";

interface RetakePhotoModalProps {
    visible: boolean;
    cameraRef: Ref<CameraView>;
    permissionGranted: boolean;
    capturing: boolean;
    onClose: () => void;
    onCapture: () => void;
}

export function RetakePhotoModal({
    visible,
    cameraRef,
    permissionGranted,
    capturing,
    onClose,
    onCapture,
}: Readonly<RetakePhotoModalProps>) {
    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                {visible && permissionGranted ? (
                    <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
                ) : null}

                <SafeAreaView style={styles.overlay}>
                    <View style={styles.topBar}>
                        <BackButton variant="onDark" onPress={onClose} />
                    </View>

                    <View style={styles.centerArea}>
                        <Text style={styles.hint}>Fotografe a caixa do medicamento</Text>
                    </View>

                    <View style={styles.controlsRow}>
                        <CameraCaptureButton
                            disabled={capturing || !permissionGranted}
                            capturing={capturing}
                            onPress={onCapture}
                            accessibilityLabel="Fotografar nova imagem do medicamento"
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
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

    topBar: {
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

    controlsRow: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
});
