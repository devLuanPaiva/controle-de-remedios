import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius } from "@/theme";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: AvatarSize;
    backgroundColor?: string;
    textColor?: string;
}

const AVATAR_DIMENSIONS: Record<AvatarSize, number> = {
    sm: 32,
    md: 44,
    lg: 72,
};

function extractInitials(name: string): string {
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    const firstInitial = nameParts[0]?.[0] ?? "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] : "";

    return (firstInitial + lastInitial).toUpperCase();
}

export function Avatar({
    name,
    imageUrl,
    size = "md",
    backgroundColor = Colors.primary,
    textColor = Colors.white,
}: Readonly<AvatarProps>) {
    const dimension = AVATAR_DIMENSIONS[size];
    const circleStyle = { width: dimension, height: dimension, borderRadius: Radius.full };

    if (imageUrl) {
        return (
            <Image
                source={{ uri: imageUrl }}
                style={[styles.image, circleStyle]}
                accessibilityLabel={name}
                contentFit="cover"
            />
        );
    }

    return (
        <View style={[styles.fallback, circleStyle, { backgroundColor }]} accessibilityLabel={name}>
            <Text style={[styles.initials, { color: textColor, fontSize: dimension * 0.38 }]}>
                {extractInitials(name)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        backgroundColor: Colors.border,
    },

    fallback: {
        alignItems: "center",
        justifyContent: "center",
    },

    initials: {
        fontFamily: "Montserrat_600SemiBold",
        letterSpacing: 0.5,
    },
});
