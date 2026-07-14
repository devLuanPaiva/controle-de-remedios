import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";

import { PrescriptionScanProvider } from "@/data/contexts/PrescriptionScanContext";
import { Colors, Typography } from "@/theme";

function renderHomeIcon({ color, size }: { color: string; size: number }) {
    return <Home color={color} size={size} />;
}

function renderProfileIcon({ color, size }: { color: string; size: number }) {
    return <User color={color} size={size} />;
}

export default function ProtectedLayout() {
    return (
        <PrescriptionScanProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: Colors.surface,
                        borderTopColor: Colors.border,
                        height: 64,
                        paddingTop: 8,
                        paddingBottom: 10,
                    },
                    tabBarLabelStyle: {
                        fontFamily: Typography.fonts.bodyMedium,
                        fontSize: Typography.sizes.xs,
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Início",
                        tabBarIcon: renderHomeIcon,
                        tabBarAccessibilityLabel: "Início",
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Perfil",
                        tabBarIcon: renderProfileIcon,
                        tabBarAccessibilityLabel: "Perfil",
                    }}
                />
                <Tabs.Screen name="prescriptions" options={{ href: null }} />
            </Tabs>
        </PrescriptionScanProvider>
    );
}
