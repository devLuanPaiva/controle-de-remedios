import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ICompany } from "@/data/models/company.model";
import { Colors, Spacing, Typography } from "@/theme";
import { CompanyRow } from "./CompanyRow";

interface CompanySectionProps {
    companies: ICompany[];
    selectedCompanyId: string | null;
    isLoading: boolean;
    error: string | null;
    onSelectCompany: (companyId: string) => void;
}

export function CompanySection({
    companies,
    selectedCompanyId,
    isLoading,
    error,
    onSelectCompany,
}: Readonly<CompanySectionProps>) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Empresa conectada</Text>

            {isLoading ? (
                <View style={styles.stateBox}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            ) : null}

            {!isLoading && error ? (
                <View style={styles.stateBox}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {!isLoading && !error && companies.length === 0 ? (
                <View style={styles.stateBox}>
                    <Text style={styles.emptyText}>Você ainda não está associado a nenhuma empresa.</Text>
                </View>
            ) : null}

            {!isLoading && !error && companies.length > 0 ? (
                <View style={styles.list}>
                    {companies.map((company) => (
                        <CompanyRow
                            key={company.id}
                            company={company}
                            isSelected={company.id === selectedCompanyId}
                            onPress={() => onSelectCompany(company.id)}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xl,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        marginBottom: Spacing.md,
    },

    list: {
        gap: Spacing.sm,
    },

    stateBox: {
        paddingVertical: Spacing.lg,
        alignItems: "center",
    },

    errorText: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
        textAlign: "center",
    },

    emptyText: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        textAlign: "center",
    },
});
