import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { ExtractedMedication } from "@/data/services/gemini.service";

interface MedicationsReadOnlyListProps {
    medications: ExtractedMedication[];
}

function medicationSummary(medication: ExtractedMedication): string {
    const quantity = medication.quantity ?? "não identificado";
    const usage = medication.usage ?? "não identificado";
    const duration = medication.duration ?? "não identificado";

    return `Qtd: ${quantity} · Uso: ${usage} · Duração: ${duration}`;
}

export function MedicationsReadOnlyList({ medications }: Readonly<MedicationsReadOnlyListProps>) {
    if (medications.length === 0) {
        return null;
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Sparkles size={16} color={Colors.primary} />
                <Text style={styles.title}>Medicamentos identificados</Text>
            </View>

            <View style={styles.list}>
                {medications.map((medication, index) => (
                    <View key={`${medication.name}-${index}`} style={styles.item}>
                        <Text style={styles.itemName}>{medication.name}</Text>
                        <Text style={styles.itemDetail}>{medicationSummary(medication)}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                Estes dados são apenas informativos e não serão salvos na receita.
            </Text>
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
        gap: Spacing.md,
        ...Shadows.sm,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    title: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    list: {
        gap: Spacing.sm,
    },

    item: {
        gap: 2,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },

    itemName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    itemDetail: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    footer: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        fontStyle: "italic",
    },
});
