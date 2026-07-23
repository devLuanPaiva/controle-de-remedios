import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";

import { Colors, Spacing, Typography } from "@/theme";
import { useCompanies } from "@/data/contexts/CompanyContext";
import { useDebouncedValue } from "@/data/hooks/useDebouncedValue";
import { PatientFilterParams } from "@/data/models/patient.model";
import { usePatientList } from "@/features/patients/hooks/usePatientList";
import { usePatientForm } from "@/features/patients/hooks/usePatientForm";
import { PatientTab, PatientTabSwitcher } from "@/features/patients/components/PatientTabSwitcher";
import { PatientFilterBar } from "@/features/patients/components/PatientFilterBar";
import { PatientCard } from "@/features/patients/components/PatientCard";
import { PatientForm } from "@/features/patients/components/PatientForm";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { BackButton } from "@/components/shared/BackButton";

const FILTER_DEBOUNCE_MS = 400;

export default function PatientsScreen() {
    const router = useRouter();
    const { selectedCompany } = useCompanies();

    const [activeTab, setActiveTab] = useState<PatientTab>("list");
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");

    const debouncedName = useDebouncedValue(name, FILTER_DEBOUNCE_MS);
    const debouncedCpf = useDebouncedValue(cpf, FILTER_DEBOUNCE_MS);

    const filter = useMemo<PatientFilterParams>(
        () => ({ name: debouncedName, cpf: debouncedCpf }),
        [debouncedName, debouncedCpf],
    );

    const patients = usePatientList(selectedCompany?.id, filter);

    const { values, setField, isSubmitting, formError, formErrorField, submit } = usePatientForm({
        companyId: selectedCompany?.id,
        onSuccess: () => {
            patients.refresh();
            setActiveTab("list");
            Alert.alert("Sucesso", "Paciente cadastrado com sucesso.");
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Pacientes</Text>
            </View>

            <View style={styles.controls}>
                <PatientTabSwitcher value={activeTab} onChange={setActiveTab} />

                {activeTab === "list" ? (
                    <PatientFilterBar name={name} cpf={cpf} onChangeName={setName} onChangeCpf={setCpf} />
                ) : null}
            </View>

            {activeTab === "list" ? (
                <PaginatedList
                    data={patients.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PatientCard
                            patient={item}
                            onPress={() => router.push(`/(protected)/patients/${item.id}` as Href)}
                        />
                    )}
                    isLoading={patients.isLoading}
                    isLoadingMore={patients.isLoadingMore}
                    error={patients.error}
                    emptyMessage="Nenhum paciente encontrado."
                    onLoadMore={patients.loadMore}
                    onRefresh={patients.refresh}
                />
            ) : (
                <KeyboardAvoidingView style={styles.formContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
                        <PatientForm
                            values={values}
                            onChangeField={setField}
                            formError={formError}
                            formErrorField={formErrorField}
                            isSubmitting={isSubmitting}
                            submitLabel="Cadastrar paciente"
                            onSubmit={submit}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
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

    controls: {
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },

    formContainer: {
        flex: 1,
    },

    formContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
});
