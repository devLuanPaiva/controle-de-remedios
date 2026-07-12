import { LayoutGrid } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/data/contexts/AuthContext";
import { usePrescriptionScan } from "@/data/contexts/PrescriptionScanContext";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { ModuleCard } from "./ModuleCard";
import { HOME_MODULES, ModuleDefinition } from "../utils/modules";

export function ModulesSection() {
    const { user } = useAuth();
    const router = useRouter();
    const { reset } = usePrescriptionScan();

    const visibleModules = HOME_MODULES.filter(
        (module) => user?.role && module.allowedRoles.includes(user.role),
    );

    function handlePress(module: ModuleDefinition) {
        if (module.id === "prescriptions") {
            reset();
        }

        router.push(module.route);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Módulos</Text>

            {visibleModules.length === 0 ? (
                <View style={styles.placeholder}>
                    <LayoutGrid size={28} color={Colors.textSecondary} />
                    <Text style={styles.placeholderTitle}>Novos módulos em breve</Text>
                    <Text style={styles.placeholderSubtitle}>
                        As principais operações do seu dia a dia vão aparecer aqui.
                    </Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {visibleModules.map((module) => (
                        <ModuleCard key={module.id} module={module} onPress={() => handlePress(module)} />
                    ))}
                </View>
            )}
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

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
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
