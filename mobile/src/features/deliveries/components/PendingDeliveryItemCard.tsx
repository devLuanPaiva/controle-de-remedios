import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PackagePlus } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { UnityTypeLabels } from "@/data/models/prescription-item.model";
import { formatDateBr } from "@/lib/dateFormat";

interface PendingDeliveryItemCardProps {
    item: IPendingDeliveryItem;
    onDeliver: () => void;
}

export function PendingDeliveryItemCard({ item, onDeliver }: Readonly<PendingDeliveryItemCardProps>) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.patientName} numberOfLines={1}>
                    {item.patientName}
                </Text>
                <Text style={styles.medicineName} numberOfLines={1}>
                    {item.medicineName}
                </Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Emitida em</Text>
                    <Text style={styles.detailValue}>{formatDateBr(item.issueDate)}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Quantidade necessária</Text>
                    <Text style={styles.detailValue}>
                        {item.prescribedQuantity} {UnityTypeLabels[item.unityType]}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.deliverButton}
                onPress={onDeliver}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Registrar entrega de ${item.medicineName} para ${item.patientName}`}
            >
                <PackagePlus size={16} color={Colors.white} />
                <Text style={styles.deliverButtonText}>Registrar entrega</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    info: {
        gap: 2,
    },

    patientName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    medicineName: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },

    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    detailLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    detailValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.text,
    },

    deliverButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 44,
    },

    deliverButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },
});
