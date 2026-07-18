import { StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { Colors, Radius } from "@/theme";

interface BackButtonProps {
    onPress?: () => void;
    variant?: "light" | "onDark";
}

export function BackButton({ onPress, variant = "light" }: Readonly<BackButtonProps>) {
    const router = useRouter();
    const isDark = variant === "onDark";

    return (
        <TouchableOpacity
            style={[styles.button, isDark ? styles.buttonOnDark : styles.buttonLight]}
            onPress={onPress ?? (() => router.back())}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
        >
            <ChevronLeft size={22} color={isDark ? Colors.white : Colors.text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonLight: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    buttonOnDark: {
        backgroundColor: "rgba(0,0,0,0.45)",
    },
});
