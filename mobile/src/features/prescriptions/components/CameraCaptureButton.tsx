import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { Colors, Shadows } from "@/theme";

interface CameraCaptureButtonProps {
    disabled?: boolean;
    capturing: boolean;
    onPress: () => void;
}

export function CameraCaptureButton({
    disabled = false,
    capturing,
    onPress,
}: Readonly<CameraCaptureButtonProps>) {
    return (
        <TouchableOpacity
            style={[styles.outerRing, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled || capturing}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tirar foto da receita"
        >
            <View style={styles.innerCircle}>
                {capturing ? <ActivityIndicator color={Colors.primary} /> : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    outerRing: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 4,
        borderColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.lg,
    },

    disabled: {
        opacity: 0.5,
    },

    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
});
