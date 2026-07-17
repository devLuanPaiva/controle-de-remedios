import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

export interface ChipOption<T extends string> {
    value: T;
    label: string;
}

interface ChipSelectorProps<T extends string> {
    label: string;
    options: ChipOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

export function ChipSelector<T extends string>({
    label,
    options,
    value,
    onChange,
}: Readonly<ChipSelectorProps<T>>) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.chipsRow}>
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.chip, selected && styles.chipSelected]}
                            onPress={() => onChange(option.value)}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            accessibilityLabel={option.label}
                        >
                            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
    },

    chip: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
    },

    chipSelected: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}14`,
    },

    chipText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    chipTextSelected: {
        color: Colors.primary,
        fontFamily: Typography.fonts.bodySemiBold,
    },
});
