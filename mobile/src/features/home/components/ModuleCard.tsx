import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { ModuleDefinition } from "../utils/modules";

interface ModuleCardProps {
    module: ModuleDefinition;
    onPress: () => void;
}

export function ModuleCard({ module, onPress }: Readonly<ModuleCardProps>) {
    const Icon = module.icon;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={module.title}
        >
            <View style={styles.iconBadge}>
                <Icon size={22} color={Colors.primary} />
            </View>

            <Text style={styles.title}>{module.title}</Text>
            <Text style={styles.subtitle}>{module.subtitle}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "48%",
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.base,
        gap: Spacing.xs,
        ...Shadows.sm,
    },

    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: Radius.lg,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.xs,
    },

    title: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
});
