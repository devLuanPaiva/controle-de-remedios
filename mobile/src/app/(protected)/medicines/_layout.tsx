import { Stack } from "expo-router";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { MedicineScanProvider } from "@/data/contexts/MedicineScanContext";
import { UserRole } from "@/data/models/user.model";

export default function MedicinesLayout() {
    return (
        <RoleGuard allow={[UserRole.MANAGER, UserRole.ASSISTANT]}>
            <MedicineScanProvider>
                <Stack screenOptions={{ headerShown: false, animation: "none" }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="result" />
                    <Stack.Screen name="register" />
                </Stack>
            </MedicineScanProvider>
        </RoleGuard>
    );
}
