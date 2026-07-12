import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/shared/Avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { UserRole } from "@/data/models/user.model";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface UserInfoCardProps {
    name: string;
    email: string;
    imageUrl?: string | null;
    role?: UserRole | null;
}

export function UserInfoCard({ name, email, imageUrl, role }: Readonly<UserInfoCardProps>) {
    return (
        <View style={styles.card}>
            <Avatar name={name} imageUrl={imageUrl} size="lg" />
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
            {role ? <RoleBadge role={role} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderRadius: Radius.xxl,
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.xl,
        gap: Spacing.xs,
        ...Shadows.sm,
    },

    name: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        marginTop: Spacing.sm,
        textAlign: "center",
    },

    email: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
        textAlign: "center",
    },
});
