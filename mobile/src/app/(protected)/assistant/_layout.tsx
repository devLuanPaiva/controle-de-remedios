import { Stack } from "expo-router";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { UserRole } from "@/data/models/user.model";

export default function AssistantLayout() {
    return (
        <RoleGuard allow={[UserRole.MANAGER, UserRole.ASSISTANT]}>
            <Stack screenOptions={{ headerShown: false, animation: "none" }}>
                <Stack.Screen name="index" />
            </Stack>
        </RoleGuard>
    );
}
