import { useAuth } from "@/data/contexts/AuthContext";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { StatusBar } from "expo-status-bar";
import { LogOut, User } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.content}>
                <View style={styles.avatar}>
                    <User size={40} color={Colors.primary} />
                </View>

                <Text style={styles.greeting}>Olá,</Text>
                <Text style={styles.name}>{user?.name ?? "Usuário"}</Text>

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={logout}
                    accessibilityRole="button"
                    accessibilityLabel="Sair"
                >
                    <LogOut size={18} color={Colors.white} />
                    <Text style={styles.buttonText}>Sair</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    avatar: {
        width: 88,
        height: 88,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.xl,
    },

    greeting: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
    },

    name: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
        marginTop: Spacing.xs,
        marginBottom: Spacing.xxl,
        textAlign: "center",
    },

    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        ...Shadows.md,
    },

    buttonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
