import { StatusBar } from "expo-status-bar";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuth } from "@/data/contexts/AuthContext";
import { useCompanies } from "@/data/contexts/CompanyContext";
import { CompanySection } from "@/features/profile/components/CompanySection";
import { DeleteAccountDialog } from "@/features/profile/components/DeleteAccountDialog";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import { UserInfoCard } from "@/features/profile/components/UserInfoCard";
import { Colors, Radius, Spacing, Typography } from "@/theme";

export default function Profile() {
    const { user, logout } = useAuth();
    const { companies, selectedCompany, isLoading, error, selectCompany } = useCompanies();
    const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

    function openLogoutDialog() {
        setIsLogoutDialogVisible(true);
    }

    function closeLogoutDialog() {
        setIsLogoutDialogVisible(false);
    }

    function confirmLogout() {
        closeLogoutDialog();
        logout();
    }

    function openDeleteDialog() {
        setIsDeleteDialogVisible(true);
    }

    function closeDeleteDialog() {
        setIsDeleteDialogVisible(false);
    }

    function handleAccountDeleted() {
        closeDeleteDialog();
        Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.", [
            { text: "OK", onPress: () => logout() },
        ]);
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Perfil</Text>
                    <ProfileMenu onRequestDeleteAccount={openDeleteDialog} />
                </View>

                <UserInfoCard
                    name={user?.name ?? "Usuário"}
                    email={user?.email ?? ""}
                    imageUrl={user?.imageUrl}
                    role={user?.role}
                />

                <CompanySection
                    companies={companies}
                    selectedCompanyId={selectedCompany?.id ?? null}
                    isLoading={isLoading}
                    error={error}
                    onSelectCompany={selectCompany}
                />

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={openLogoutDialog}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Sair da conta"
                >
                    <LogOut size={18} color={Colors.danger} />
                    <Text style={styles.logoutLabel}>Sair da conta</Text>
                </TouchableOpacity>
            </ScrollView>

            <ConfirmDialog
                visible={isLogoutDialogVisible}
                title="Sair da conta"
                message="Tem certeza que deseja encerrar sua sessão?"
                confirmLabel="Sair"
                cancelLabel="Cancelar"
                destructive
                onConfirm={confirmLogout}
                onCancel={closeLogoutDialog}
            />

            <DeleteAccountDialog
                visible={isDeleteDialogVisible}
                onCancel={closeDeleteDialog}
                onDeleted={handleAccountDeleted}
            />
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

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Spacing.lg,
    },

    screenTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        marginTop: Spacing.xl,
        height: 52,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.danger,
    },

    logoutLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.danger,
    },
});
