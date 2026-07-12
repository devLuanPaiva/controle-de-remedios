import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Volume2 } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface SpeechTipButtonProps {
    isSpeaking: boolean;
    onPress: () => void;
}

export function SpeechTipButton({ isSpeaking, onPress }: Readonly<SpeechTipButtonProps>) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!isSpeaking) {
            pulse.setValue(1);
            return;
        }

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.12, duration: 420, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
            ]),
        );

        loop.start();
        return () => loop.stop();
    }, [isSpeaking, pulse]);

    return (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
                style={styles.button}
                onPress={onPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ouvir dica de fotografia"
            >
                <Volume2 size={16} color={Colors.white} />
                <Text style={styles.label}>Dica</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: "rgba(3,89,65,0.85)",
        borderRadius: Radius.full,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        ...Shadows.md,
    },

    label: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },
});
