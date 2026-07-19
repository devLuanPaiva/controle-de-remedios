import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

export type DeliveryTab = "completed" | "pending";

interface DeliveryTabOption {
    value: DeliveryTab;
    label: string;
}

const TABS: DeliveryTabOption[] = [
    { value: "completed", label: "Realizadas" },
    { value: "pending", label: "Pendentes" },
];

interface DeliveryTabSwitcherProps {
    value: DeliveryTab;
    onChange: (tab: DeliveryTab) => void;
}

export function DeliveryTabSwitcher({ value, onChange }: Readonly<DeliveryTabSwitcherProps>) {
    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const selected = tab.value === value;

                return (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tab, selected && styles.tabSelected]}
                        onPress={() => onChange(tab.value)}
                        activeOpacity={0.85}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        accessibilityLabel={tab.label}
                    >
                        <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{tab.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: Spacing.xs,
        backgroundColor: Colors.background,
        borderRadius: Radius.full,
        padding: 4,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
    },

    tabSelected: {
        backgroundColor: Colors.primary,
    },

    tabText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    tabTextSelected: {
        fontFamily: Typography.fonts.bodySemiBold,
        color: Colors.white,
    },
});
