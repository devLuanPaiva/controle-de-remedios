import { LinearGradient } from "expo-linear-gradient";
import { Bot, ChevronRight, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Gradients, Radius, Shadows, Spacing, Typography } from "@/theme";

interface AssistantFeatureCardProps {
    onPress: () => void;
}

export function AssistantFeatureCard({ onPress }: Readonly<AssistantFeatureCardProps>) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Assistente IA"
        >
            <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.iconBadge}>
                    <Bot size={26} color={Colors.white} />
                </View>

                <View style={styles.textBlock}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Assistente IA</Text>
                        <Sparkles size={14} color="rgba(255,255,255,0.85)" />
                    </View>
                    <Text style={styles.subtitle}>Pergunte sobre entregas e pacientes em tempo real</Text>
                </View>

                <ChevronRight size={20} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        borderRadius: Radius.xxl,
        padding: Spacing.base,
        marginTop: Spacing.lg,
        ...Shadows.md,
    },

    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: Radius.lg,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    textBlock: {
        flex: 1,
        gap: 2,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    title: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: "rgba(255,255,255,0.85)",
        lineHeight: 15,
    },
});
