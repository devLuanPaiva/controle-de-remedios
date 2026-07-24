import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react-native";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useDeleteAccount } from "@/features/auth/hooks/useDeleteAccount";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface DeleteAccountDialogProps {
    visible: boolean;
    onCancel: () => void;
    onDeleted: () => void;
}

export function DeleteAccountDialog({ visible, onCancel, onDeleted }: Readonly<DeleteAccountDialogProps>) {
    const [securePassword, setSecurePassword] = useState(true);
    const { password, setPassword, isSubmitting, formError, submit, reset } = useDeleteAccount({
        onSuccess: onDeleted,
    });

    function handleCancel() {
        reset();
        onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <Pressable style={styles.backdrop} onPress={handleCancel} accessibilityLabel="Fechar">
                <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.title}>Excluir conta</Text>
                    <Text style={styles.message}>
                        Essa ação é permanente e não pode ser desfeita. Digite sua senha para confirmar a
                        exclusão da sua conta.
                    </Text>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputWrapper}>
                        <Lock size={18} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua senha"
                            placeholderTextColor={Colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={securePassword}
                            editable={!isSubmitting}
                            accessibilityLabel="Senha"
                        />
                        <TouchableOpacity
                            onPress={() => setSecurePassword((prev) => !prev)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={securePassword ? "Mostrar senha" : "Ocultar senha"}
                        >
                            {securePassword ? (
                                <EyeOff size={18} color={Colors.textSecondary} />
                            ) : (
                                <Eye size={18} color={Colors.textSecondary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            activeOpacity={0.85}
                            disabled={isSubmitting}
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar"
                        >
                            <Text style={styles.cancelLabel}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.destructiveButton, isSubmitting && styles.buttonDisabled]}
                            onPress={submit}
                            activeOpacity={0.85}
                            disabled={isSubmitting}
                            accessibilityRole="button"
                            accessibilityLabel="Excluir conta"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.confirmLabel}>Excluir</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(26,26,26,0.5)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    card: {
        width: "100%",
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        ...Shadows.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    message: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        lineHeight: 20,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.danger}1A`,
        borderWidth: 1,
        borderColor: `${Colors.danger}40`,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        marginTop: Spacing.lg,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        height: 54,
        marginTop: Spacing.lg,
    },

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: 0,
    },

    actions: {
        flexDirection: "row",
        gap: Spacing.md,
        marginTop: Spacing.xl,
    },

    button: {
        flex: 1,
        height: 48,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },

    cancelButton: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    destructiveButton: {
        backgroundColor: Colors.danger,
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    cancelLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    confirmLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.white,
    },
});
