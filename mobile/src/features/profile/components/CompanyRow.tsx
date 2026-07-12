import { Building2, Check } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ICompany } from "@/data/models/company.model";
import { Colors, Radius, Spacing, Typography } from "@/theme";

interface CompanyRowProps {
    company: ICompany;
    isSelected: boolean;
    onPress: () => void;
}

export function CompanyRow({ company, isSelected, onPress }: Readonly<CompanyRowProps>) {
    return (
        <TouchableOpacity
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar empresa ${company.name}`}
            accessibilityState={{ selected: isSelected }}
        >
            <View style={[styles.iconBadge, isSelected && styles.iconBadgeSelected]}>
                <Building2 size={18} color={isSelected ? Colors.white : Colors.textSecondary} />
            </View>

            <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
                {company.name}
            </Text>

            {isSelected ? <Check size={20} color={Colors.primary} /> : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.base,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
    },

    rowSelected: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}0D`,
    },

    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.background,
    },

    iconBadgeSelected: {
        backgroundColor: Colors.primary,
    },

    name: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    nameSelected: {
        fontFamily: Typography.fonts.bodySemiBold,
        color: Colors.primary,
    },
});
