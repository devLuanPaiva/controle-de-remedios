import { LayoutGrid } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

export function ModulesSection() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Módulos</Text>

            <View style={styles.placeholder}>
                <LayoutGrid size={28} color={Colors.textSecondary} />
                <Text style={styles.placeholderTitle}>Novos módulos em breve</Text>
                <Text style={styles.placeholderSubtitle}>
                    As principais operações do seu dia a dia vão aparecer aqui.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xl,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        marginBottom: Spacing.md,
    },

    placeholder: {
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: "dashed",
        borderRadius: Radius.xl,
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.xl,
    },

    placeholderTitle: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        marginTop: Spacing.xs,
    },

    placeholderSubtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 18,
    },
});
