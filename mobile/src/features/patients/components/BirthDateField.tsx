import { StyleSheet, Text, TextInput, View } from "react-native";
import { Calendar } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface BirthDateFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

function maskBrDate(text: string): string {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    return parts.join("/");
}

export function BirthDateField({ value, onChange, error }: Readonly<BirthDateFieldProps>) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Data de nascimento</Text>

            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
                <Calendar size={18} color={Colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={Colors.textSecondary}
                    value={value}
                    onChangeText={(text) => onChange(maskBrDate(text))}
                    keyboardType="number-pad"
                    maxLength={10}
                    accessibilityLabel="Data de nascimento do paciente"
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        height: 54,
    },

    inputWrapperError: {
        borderColor: Colors.danger,
    },

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: 0,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.danger,
    },
});
