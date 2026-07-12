import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { UserRole, UserRoleLabels } from "@/data/models/user.model";

interface RoleBadgeProps {
    role: UserRole;
}

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
    [UserRole.ADMIN]: Colors.primary,
    [UserRole.MANAGER]: Colors.warning,
    [UserRole.USER]: Colors.info,
    [UserRole.PATIENT]: Colors.success,
};

export function RoleBadge({ role }: Readonly<RoleBadgeProps>) {
    return (
        <View style={[styles.badge, { backgroundColor: ROLE_BADGE_COLORS[role] }]}>
            <Text style={styles.label}>{UserRoleLabels[role]}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignSelf: "center",
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.full,
    },

    label: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.xs,
        color: Colors.white,
        letterSpacing: 0.3,
    },
});
