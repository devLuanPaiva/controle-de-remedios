import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { formatCpf } from "@/lib/cpf";
import { PatientFormValues } from "@/features/patients/hooks/usePatientForm";
import { BirthDateField } from "./BirthDateField";

interface PatientFormProps {
    values: PatientFormValues;
    onChangeField: <K extends keyof PatientFormValues>(field: K, value: PatientFormValues[K]) => void;
    formError: string | null;
    formErrorField?: string;
    isSubmitting: boolean;
    submitLabel: string;
    onSubmit: () => void;
}

export function PatientForm({
    values,
    onChangeField,
    formError,
    formErrorField,
    isSubmitting,
    submitLabel,
    onSubmit,
}: Readonly<PatientFormProps>) {
    return (
        <View style={styles.container}>
            {formError ? (
                <View style={styles.errorBox}>
                    <AlertCircle size={16} color={Colors.danger} />
                    <Text style={styles.errorText}>{formError}</Text>
                </View>
            ) : null}

            <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={[styles.input, formErrorField === "name" && styles.inputError]}
                    value={values.name}
                    onChangeText={(text) => onChangeField("name", text)}
                    placeholder="Nome completo do paciente"
                    placeholderTextColor={Colors.textSecondary}
                    autoCapitalize="words"
                    accessibilityLabel="Nome do paciente"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                    style={[styles.input, formErrorField === "cpf" && styles.inputError]}
                    value={values.cpf}
                    onChangeText={(text) => onChangeField("cpf", formatCpf(text))}
                    placeholder="000.000.000-00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={14}
                    accessibilityLabel="CPF do paciente"
                />
            </View>

            <BirthDateField
                value={values.birthDate}
                onChange={(text) => onChangeField("birthDate", text)}
                error={formErrorField === "birthDate" ? (formError ?? undefined) : null}
            />

            <View style={styles.field}>
                <Text style={styles.label}>Contato (opcional)</Text>
                <TextInput
                    style={[styles.input, formErrorField === "contact" && styles.inputError]}
                    value={values.contact}
                    onChangeText={(text) => onChangeField("contact", text)}
                    placeholder="Telefone ou e-mail"
                    placeholderTextColor={Colors.textSecondary}
                    accessibilityLabel="Contato do paciente"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Endereço (opcional)</Text>
                <TextInput
                    style={[styles.input, formErrorField === "address" && styles.inputError]}
                    value={values.address}
                    onChangeText={(text) => onChangeField("address", text)}
                    placeholder="Rua, número, bairro, cidade"
                    placeholderTextColor={Colors.textSecondary}
                    accessibilityLabel="Endereço do paciente"
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={submitLabel}
            >
                {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.submitButtonText}>{submitLabel}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.lg,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    inputError: {
        borderColor: Colors.danger,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.danger}1A`,
        borderWidth: 1,
        borderColor: `${Colors.danger}40`,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.md,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
