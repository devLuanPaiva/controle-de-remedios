import { StyleSheet, Text, View } from "react-native";
import { PackageCheck } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IDelivery } from "@/data/models/delivery.model";
import { UnityTypeLabels } from "@/data/models/prescription-item.model";
import { formatDateBr } from "@/lib/dateFormat";

interface CompletedDeliveryCardProps {
    delivery: IDelivery;
}

export function CompletedDeliveryCard({ delivery }: Readonly<CompletedDeliveryCardProps>) {
    return (
        <View style={styles.card}>
            <View style={styles.iconWrapper}>
                <PackageCheck size={22} color={Colors.success} />
            </View>

            <View style={styles.info}>
                <Text style={styles.patientName} numberOfLines={1}>
                    {delivery.patientName}
                </Text>
                <Text style={styles.medicineName} numberOfLines={1}>
                    {delivery.medicineName}
                </Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Entregue em</Text>
                    <Text style={styles.detailValue}>{formatDateBr(delivery.deliveryDate)}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Disponível em</Text>
                    <Text style={styles.detailValue}>{formatDateBr(delivery.nextAvailableDate)}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Quantidade</Text>
                    <Text style={styles.detailValue}>
                        {delivery.deliveryQuantity} {UnityTypeLabels[delivery.unityType]}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        backgroundColor: `${Colors.success}1A`,
        alignItems: "center",
        justifyContent: "center",
    },

    info: {
        flex: 1,
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
});
