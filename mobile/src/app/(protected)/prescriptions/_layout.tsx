import { Stack } from "expo-router";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/data/models/user.model";

export default function PrescriptionsLayout() {
    return (
        <RoleGuard allow={[UserRole.MANAGER]}>
            <Stack screenOptions={{ headerShown: false, animation: "none" }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="review" />
            </Stack>
        </RoleGuard>
    );
}
