import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { DatabaseX, KeyRound, MoreVertical, ShieldCheck, Trash2 } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PRIVACY_POLICY_URL } from "@/lib/externalLinks";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface ProfileMenuProps {
    onRequestDeleteAccount: () => void;
    onRequestDataDeletion: () => void;
}

export function ProfileMenu({ onRequestDeleteAccount, onRequestDataDeletion }: Readonly<ProfileMenuProps>) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    function close() {
        setIsOpen(false);
    }

    function openPrivacyPolicy() {
        close();
        WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
    }

    function goToChangePassword() {
        close();
        router.push("/(protected)/change-password" as Href);
    }

    function requestDeleteAccount() {
        close();
        onRequestDeleteAccount();
    }

    function requestDataDeletion() {
        close();
        onRequestDataDeletion();
    }

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setIsOpen(true)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Mais opções"
            >
                <MoreVertical size={22} color={Colors.text} />
            </TouchableOpacity>

            <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
                <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Fechar menu">
                    <View style={[styles.menu, { top: insets.top + Spacing.xxl }]}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={openPrivacyPolicy}
                            accessibilityRole="button"
                            accessibilityLabel="Política de privacidade"
                        >
                            <ShieldCheck size={18} color={Colors.text} />
                            <Text style={styles.menuLabel}>Política de privacidade</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={goToChangePassword}
                            accessibilityRole="button"
                            accessibilityLabel="Alterar senha"
                        >
                            <KeyRound size={18} color={Colors.text} />
                            <Text style={styles.menuLabel}>Alterar senha</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={requestDataDeletion}
                            accessibilityRole="button"
                            accessibilityLabel="Solicitar exclusão de dados"
                        >
                            <DatabaseX size={18} color={Colors.text} />
                            <Text style={styles.menuLabel}>Solicitar exclusão de dados</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={requestDeleteAccount}
                            accessibilityRole="button"
                            accessibilityLabel="Excluir conta"
                        >
                            <Trash2 size={18} color={Colors.danger} />
                            <Text style={[styles.menuLabel, styles.destructiveLabel]}>Excluir conta</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },

    backdrop: {
        flex: 1,
    },

    menu: {
        position: "absolute",
        right: Spacing.xl,
        minWidth: 220,
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.xs,
        ...Shadows.md,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    menuLabel: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    destructiveLabel: {
        color: Colors.danger,
    },
});
