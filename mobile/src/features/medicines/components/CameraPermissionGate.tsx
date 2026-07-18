import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera as CameraIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface CameraPermissionGateProps {
    subtitle: string;
    onRequestPermission: () => void;
}

export function CameraPermissionGate({ subtitle, onRequestPermission }: Readonly<CameraPermissionGateProps>) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.iconBadge}>
                <CameraIcon size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Acesso à câmera necessário</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={onRequestPermission}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Permitir acesso à câmera"
            >
                <Text style={styles.buttonText}>Permitir acesso</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.md,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },

    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        textAlign: "center",
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },

    button: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.md,
        ...Shadows.md,
    },

    buttonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
    },
});
