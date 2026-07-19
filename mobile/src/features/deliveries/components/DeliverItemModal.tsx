import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";

interface DeliverItemModalProps {
    item: IPendingDeliveryItem | null;
    isSubmitting: boolean;
    onConfirm: (quantity: number) => void;
    onCancel: () => void;
}

export function DeliverItemModal({
    item,
    isSubmitting,
    onConfirm,
    onCancel,
}: Readonly<DeliverItemModalProps>) {
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
        if (item) {
            setQuantity(String(item.prescribedQuantity));
        }
    }, [item]);

    const parsedQuantity = Number(quantity);
    const isValidQuantity =
        Number.isInteger(parsedQuantity) && parsedQuantity > 0 && (!item || parsedQuantity <= item.prescribedQuantity);
    const isPartial = Boolean(item) && isValidQuantity && parsedQuantity < (item?.prescribedQuantity ?? 0);

    return (
        <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={onCancel}>
            <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Fechar">
                <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.title}>Registrar entrega</Text>

                    {item ? (
                        <Text style={styles.subtitle}>
                            {item.medicineName} para {item.patientName}
                        </Text>
                    ) : null}

                    <View style={styles.field}>
                        <Text style={styles.label}>Quantidade entregue</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                            accessibilityLabel="Quantidade entregue"
                        />
                        {item ? (
                            <Text style={styles.hint}>Quantidade prescrita: {item.prescribedQuantity}</Text>
                        ) : null}
                    </View>

                    {isPartial ? (
                        <View style={styles.warningBox}>
                            <AlertCircle size={16} color={Colors.warning} />
                            <Text style={styles.warningText}>
                                Entregar menos que o prescrito deixará este item como parcialmente entregue.
                            </Text>
                        </View>
                    ) : null}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar"
                        >
                            <Text style={styles.cancelLabel}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                (!isValidQuantity || isSubmitting) && styles.buttonDisabled,
                            ]}
                            onPress={() => onConfirm(parsedQuantity)}
                            disabled={!isValidQuantity || isSubmitting}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Confirmar entrega"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.confirmLabel}>Confirmar entrega</Text>
                            )}
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
        gap: Spacing.md,
        ...Shadows.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
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
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    hint: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.warning}1A`,
        borderWidth: 1,
        borderColor: `${Colors.warning}40`,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    warningText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.text,
    },

    actions: {
        flexDirection: "row",
        gap: Spacing.md,
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

    buttonDisabled: {
        opacity: 0.6,
    },

    cancelLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
        textAlign: "center",
    },

    confirmLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.white,
        textAlign: "center",
    },
});
