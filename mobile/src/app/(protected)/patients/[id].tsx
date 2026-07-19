import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Pencil } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { usePatientDetails } from "@/features/patients/hooks/usePatientDetails";
import { usePatientForm } from "@/features/patients/hooks/usePatientForm";
import { PatientDetailInfo } from "@/features/patients/components/PatientDetailInfo";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { BackButton } from "@/components/shared/BackButton";

export default function PatientDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { patient, setPatient, isLoading, error } = usePatientDetails(id);
    const [isEditing, setIsEditing] = useState(false);

    const { values, setField, isSubmitting, formError, formErrorField, submit } = usePatientForm({
        patient,
        onSuccess: (updated) => {
            setPatient(updated);
            setIsEditing(false);
            Alert.alert("Sucesso", "Paciente atualizado com sucesso.");
        },
    });

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !patient) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.header}>
                    <BackButton />
                    <Text style={styles.title}>Paciente</Text>
                </View>

                <View style={styles.centerState}>
                    <Text style={styles.errorText}>{error ?? "Paciente não encontrado."}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton onPress={isEditing ? () => setIsEditing(false) : undefined} />
                <Text style={styles.title}>{isEditing ? "Editar paciente" : "Detalhes do paciente"}</Text>
            </View>

            {isEditing ? (
                <KeyboardAvoidingView style={styles.formContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                        <PatientForm
                            values={values}
                            onChangeField={setField}
                            formError={formError}
                            formErrorField={formErrorField}
                            isSubmitting={isSubmitting}
                            submitLabel="Salvar alterações"
                            onSubmit={submit}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <PatientDetailInfo patient={patient} />

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditing(true)}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Editar paciente"
                    >
                        <Pencil size={16} color={Colors.white} />
                        <Text style={styles.editButtonText}>Editar paciente</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.base,
        color: Colors.danger,
        textAlign: "center",
    },

    formContainer: {
        flex: 1,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
        gap: Spacing.xl,
    },

    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        ...Shadows.md,
    },

    editButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
