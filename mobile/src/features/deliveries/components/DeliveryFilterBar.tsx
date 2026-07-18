import { StyleSheet, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface DeliveryFilterBarProps {
    name: string;
    cpf: string;
    onChangeName: (value: string) => void;
    onChangeCpf: (value: string) => void;
}

export function DeliveryFilterBar({
    name,
    cpf,
    onChangeName,
    onChangeCpf,
}: Readonly<DeliveryFilterBarProps>) {
    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <Search size={16} color={Colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="Nome do paciente"
                    placeholderTextColor={Colors.textSecondary}
                    value={name}
                    onChangeText={onChangeName}
                    autoCapitalize="words"
                    accessibilityLabel="Filtrar por nome do paciente"
                />
            </View>

            <View style={styles.field}>
                <Search size={16} color={Colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="CPF do paciente"
                    placeholderTextColor={Colors.textSecondary}
                    value={cpf}
                    onChangeText={onChangeCpf}
                    keyboardType="numeric"
                    accessibilityLabel="Filtrar por CPF do paciente"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: Spacing.sm,
    },

    field: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        height: 44,
    },

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
        paddingVertical: 0,
    },
});
