import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/data/contexts/AuthContext";
import { HeroCard } from "@/features/home/components/HeroCard";
import { ModulesSection } from "@/features/home/components/ModulesSection";
import { Colors, Spacing } from "@/theme";

export default function Home() {
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <HeroCard name={user?.name ?? "Usuário"} imageUrl={user?.imageUrl} />
                <ModulesSection />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
});
