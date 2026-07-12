import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/shared/Avatar";
import { Colors, Gradients, Radius, Shadows, Spacing, Typography } from "@/theme";
import { getGreeting } from "../utils/greeting";

interface HeroCardProps {
    name: string;
    imageUrl?: string | null;
}

export function HeroCard({ name, imageUrl }: Readonly<HeroCardProps>) {
    const greeting = getGreeting(new Date().getHours());

    return (
        <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.textBlock}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.subtitle}>Bem-vindo(a) de volta ao ChegaMed.</Text>
            </View>

            <Avatar
                name={name}
                imageUrl={imageUrl}
                size="lg"
                backgroundColor="rgba(255,255,255,0.18)"
                textColor={Colors.white}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: Radius.xxl,
        padding: Spacing.xl,
        ...Shadows.md,
    },

    textBlock: {
        flex: 1,
        marginRight: Spacing.base,
    },

    greeting: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: "rgba(255,255,255,0.85)",
    },

    name: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.white,
        marginTop: Spacing.xs,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: "rgba(255,255,255,0.75)",
        marginTop: Spacing.sm,
        lineHeight: 18,
    },
});
