import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface ProcessingOverlayProps {
    visible: boolean;
    uploadLabel: string | null;
    title?: string;
    defaultUploadLabel?: string;
    secondaryLabel?: string;
}

export function ProcessingOverlay({
    visible,
    uploadLabel,
    title = "Processando receituário",
    defaultUploadLabel = "Enviando imagens...",
    secondaryLabel = "Analisando receita com IA...",
}: Readonly<ProcessingOverlayProps>) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color={Colors.primary} />

                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.stepList}>
                        <Text style={styles.step}>{uploadLabel ?? defaultUploadLabel}</Text>
                        <Text style={styles.step}>{secondaryLabel}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(26,26,26,0.6)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    card: {
        width: "100%",
        alignItems: "center",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        ...Shadows.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.lg,
        color: Colors.text,
    },

    stepList: {
        gap: Spacing.xs,
        alignItems: "center",
    },

    step: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        textAlign: "center",
    },
});
