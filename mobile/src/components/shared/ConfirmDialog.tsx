import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    destructive = false,
    onConfirm,
    onCancel,
}: Readonly<ConfirmDialogProps>) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Fechar">
                <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={cancelLabel}
                        >
                            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, destructive ? styles.destructiveButton : styles.confirmButton]}
                            onPress={onConfirm}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={confirmLabel}
                        >
                            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(26,26,26,0.5)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    card: {
        width: "100%",
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        ...Shadows.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    message: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        lineHeight: 20,
    },

    actions: {
        flexDirection: "row",
        gap: Spacing.md,
        marginTop: Spacing.xl,
    },

    button: {
        flex: 1,
        height: 48,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },

    cancelButton: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    confirmButton: {
        backgroundColor: Colors.primary,
    },

    destructiveButton: {
        backgroundColor: Colors.danger,
    },

    cancelLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    confirmLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.white,
    },
});
