import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, MapPin, Phone, User } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPatient } from "@/data/models/patient.model";
import { formatCpf } from "@/lib/cpf";

interface PatientCardProps {
    patient: IPatient;
    onPress: () => void;
}

export function PatientCard({ patient, onPress }: Readonly<PatientCardProps>) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${patient.name}`}
        >
            <View style={styles.iconWrapper}>
                <User size={22} color={Colors.primary} />
            </View>

            <View style={styles.info}>
                <Text style={styles.patientName} numberOfLines={1}>
                    {patient.name}
                </Text>
                <Text style={styles.cpfText}>{formatCpf(patient.cpf)}</Text>

                <View style={styles.detailRow}>
                    <Phone size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {patient.contact || "Contato não informado"}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {patient.address || "Endereço não informado"}
                    </Text>
                </View>
            </View>

            <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
    },

    info: {
        flex: 1,
        gap: 2,
    },

    patientName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    cpfText: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    detailText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },
});
