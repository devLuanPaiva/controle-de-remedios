import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPatient } from "@/data/models/patient.model";
import { formatCpf } from "@/lib/cpf";
import { formatDateBr } from "@/lib/dateFormat";

interface PatientDetailInfoProps {
    patient: IPatient;
}

interface InfoRow {
    label: string;
    value: string;
}

export function PatientDetailInfo({ patient }: Readonly<PatientDetailInfoProps>) {
    const rows: InfoRow[] = [
        { label: "Nome", value: patient.name },
        { label: "CPF", value: formatCpf(patient.cpf) },
        { label: "Data de nascimento", value: formatDateBr(patient.birthDate) },
        { label: "Contato", value: patient.contact || "Não informado" },
        { label: "Endereço", value: patient.address || "Não informado" },
    ];

    return (
        <View style={styles.card}>
            {rows.map((row) => (
                <View key={row.label} style={styles.row}>
                    <Text style={styles.label}>{row.label}</Text>
                    <Text style={styles.value}>{row.value}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        gap: Spacing.base,
        ...Shadows.sm,
    },

    row: {
        gap: 2,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    value: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },
});
