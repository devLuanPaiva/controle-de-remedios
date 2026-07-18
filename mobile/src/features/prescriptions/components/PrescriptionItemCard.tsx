import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AlertCircle, Pencil, Pill, Trash2 } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import {
    CreatePrescriptionItemRequest,
    FrequencyTypeLabels,
    TreatmentTypeLabels,
    UnityTypeLabels,
} from "@/data/models/prescription-item.model";

interface PrescriptionItemCardProps {
    item: CreatePrescriptionItemRequest;
    onEdit: () => void;
    onDelete: () => void;
    errorMessage?: string;
}

function summarize(item: CreatePrescriptionItemRequest): string {
    const unity = UnityTypeLabels[item.unityType];
    const frequencyType = FrequencyTypeLabels[item.frequencyType];
    const treatmentType = TreatmentTypeLabels[item.treatmentType];

    return (
        `${unity} · ${item.frequency}x ${frequencyType.toLowerCase()} · ` +
        `${item.treatmentDays} dias (${treatmentType.toLowerCase()}) · Qtd: ${item.prescribedQuantity}`
    );
}

export function PrescriptionItemCard({
    item,
    onEdit,
    onDelete,
    errorMessage,
}: Readonly<PrescriptionItemCardProps>) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = Boolean(item.medicine.imageUrl) && !imageFailed;
    const hasError = Boolean(errorMessage);

    return (
        <View style={[styles.card, hasError && styles.cardError]}>
            <View style={styles.row}>
                <View style={styles.imageWrapper}>
                    {showImage ? (
                        <Image
                            source={{ uri: item.medicine.imageUrl }}
                            style={styles.image}
                            onError={() => setImageFailed(true)}
                            accessibilityLabel={`Imagem de ${item.medicine.name}`}
                        />
                    ) : (
                        <Pill size={22} color={Colors.textSecondary} />
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>
                        {item.medicine.name}
                    </Text>
                    <Text style={styles.dosage} numberOfLines={2}>
                        {item.dosage}
                    </Text>
                    <Text style={styles.summary} numberOfLines={2}>
                        {summarize(item)}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onEdit}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${item.medicine.name}`}
                    >
                        <Pencil size={16} color={Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onDelete}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${item.medicine.name}`}
                    >
                        <Trash2 size={16} color={Colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            {hasError ? (
                <View style={styles.errorRow}>
                    <AlertCircle size={14} color={Colors.danger} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    cardError: {
        borderColor: Colors.danger,
        borderWidth: 1.5,
    },

    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.md,
    },

    imageWrapper: {
        width: 48,
        height: 48,
        borderRadius: Radius.lg,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    image: {
        width: "100%",
        height: "100%",
    },

    info: {
        flex: 1,
        gap: 2,
    },

    name: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    dosage: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    summary: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    errorRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.danger,
    },

    actions: {
        gap: Spacing.sm,
    },

    actionButton: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.background,
    },
});
