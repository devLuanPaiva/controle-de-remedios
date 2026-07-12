import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Search } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { usePatientSearch } from "@/data/hooks/usePatientSearch";
import { IPatient } from "@/data/models/patient.model";
import { formatCpf } from "@/lib/cpf";

interface PatientSearchFieldProps {
    selectedPatient: IPatient | null;
    onSelect: (patient: IPatient) => void;
    onClear: () => void;
    initialQuery?: string;
}

export function PatientSearchField({
    selectedPatient,
    onSelect,
    onClear,
    initialQuery = "",
}: Readonly<PatientSearchFieldProps>) {
    const { query, setQuery, results, isSearching, hasSearched } = usePatientSearch(initialQuery);

    if (selectedPatient) {
        return (
            <View style={styles.chip}>
                <View style={styles.chipInfo}>
                    <Text style={styles.chipName}>{selectedPatient.name}</Text>
                    <Text style={styles.chipDetail}>{formatCpf(selectedPatient.cpf)}</Text>
                </View>

                <TouchableOpacity
                    onPress={onClear}
                    accessibilityRole="button"
                    accessibilityLabel="Trocar paciente selecionado"
                >
                    <Text style={styles.chipAction}>Trocar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                <Search size={18} color={Colors.textSecondary} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar paciente por nome ou CPF"
                    placeholderTextColor={Colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="words"
                    accessibilityLabel="Buscar paciente"
                />
                {isSearching ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
            </View>

            {results.length > 0 ? (
                <View style={styles.resultsList}>
                    {results.map((patient) => (
                        <TouchableOpacity
                            key={patient.id}
                            style={styles.resultItem}
                            onPress={() => onSelect(patient)}
                            accessibilityRole="button"
                            accessibilityLabel={`Selecionar paciente ${patient.name}`}
                        >
                            <Text style={styles.resultName}>{patient.name}</Text>
                            <Text style={styles.resultDetail}>{formatCpf(patient.cpf)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}

            {hasSearched && !isSearching && results.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.sm,
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

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: 0,
    },

    resultsList: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
    },

    resultItem: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 2,
    },

    resultName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    resultDetail: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    emptyText: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    chip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        ...Shadows.sm,
    },

    chipInfo: {
        gap: 2,
    },

    chipName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    chipDetail: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    chipAction: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },
});
