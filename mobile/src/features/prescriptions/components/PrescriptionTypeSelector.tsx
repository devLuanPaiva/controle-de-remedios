import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { PrescriptionType } from "@/data/services/gemini.service";

interface PrescriptionTypeOption {
    value: PrescriptionType;
    label: string;
}

const OPTIONS: PrescriptionTypeOption[] = [
    { value: "DIGITAL", label: "Digital (e-SUS)" },
    { value: "HANDWRITTEN", label: "Manuscrita" },
];

interface PrescriptionTypeSelectorProps {
    value: PrescriptionType | null;
    onChange: (type: PrescriptionType) => void;
    disabled?: boolean;
}

export function PrescriptionTypeSelector({
    value,
    onChange,
    disabled = false,
}: Readonly<PrescriptionTypeSelectorProps>) {
    return (
        <View style={styles.container}>
            {OPTIONS.map((option) => {
                const isSelected = value === option.value;

                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                        onPress={() => onChange(option.value)}
                        activeOpacity={0.85}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled }}
                        accessibilityLabel={`Tipo de receita: ${option.label}`}
                    >
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: Spacing.sm,
    },

    pill: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        borderRadius: Radius.full,
        backgroundColor: "rgba(255,255,255,0.16)",
    },

    pillSelected: {
        backgroundColor: Colors.white,
    },

    label: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    labelSelected: {
        color: Colors.primary,
    },
});
