import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { Colors, Radius, Shadows, Spacing } from "@/theme";
import { AssistantAvatar } from "./AssistantAvatar";

const DOT_DELAY_MS = 160;
const BOUNCE_DURATION_MS = 300;

function useDotAnimation(delay: number) {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(translateY, {
                    toValue: -4,
                    duration: BOUNCE_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: BOUNCE_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.delay((2 - delay / DOT_DELAY_MS) * DOT_DELAY_MS),
            ]),
        );

        animation.start();
        return () => animation.stop();
    }, [delay, translateY]);

    return translateY;
}

export function TypingIndicator() {
    const firstDot = useDotAnimation(0);
    const secondDot = useDotAnimation(DOT_DELAY_MS);
    const thirdDot = useDotAnimation(DOT_DELAY_MS * 2);

    return (
        <View style={styles.row}>
            <AssistantAvatar />

            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, { transform: [{ translateY: firstDot }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: secondDot }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: thirdDot }] }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },

    bubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderBottomLeftRadius: Radius.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        ...Shadows.sm,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: Radius.full,
        backgroundColor: Colors.textSecondary,
    },
});
