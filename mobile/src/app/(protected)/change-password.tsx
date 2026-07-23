import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react-native";

import { BackButton } from "@/components/shared/BackButton";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

export default function ChangePassword() {
    const router = useRouter();

    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        isSubmitting,
        formError,
        formErrorField,
        submit,
    } = useChangePassword({
        onSuccess: () => {
            Alert.alert("Sucesso", "Senha alterada com sucesso.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        },
    });

    const currentPasswordInputRef = useRef<TextInput>(null);
    const newPasswordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const [secureCurrentPassword, setSecureCurrentPassword] = useState(true);
    const [secureNewPassword, setSecureNewPassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <BackButton />
                    <Text style={styles.title}>Alterar senha</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>
                        Informe sua senha atual e escolha uma nova senha de 6 a 20 caracteres.
                    </Text>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={18} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Senha atual</Text>
                            <Pressable
                                onPress={() => currentPasswordInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    formErrorField === "currentPassword" && styles.inputWrapperError,
                                ]}
                            >
                                <Lock size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={currentPasswordInputRef}
                                    style={styles.input}
                                    placeholder="Digite sua senha atual"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={secureCurrentPassword}
                                    editable={!isSubmitting}
                                    accessibilityLabel="Senha atual"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setSecureCurrentPassword((prev) => !prev)}
                                    hitSlop={10}
                                    accessibilityRole="button"
                                    accessibilityLabel={secureCurrentPassword ? "Mostrar senha" : "Ocultar senha"}
                                >
                                    {secureCurrentPassword ? (
                                        <EyeOff size={18} color={Colors.textSecondary} />
                                    ) : (
                                        <Eye size={18} color={Colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </Pressable>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nova senha</Text>
                            <Pressable
                                onPress={() => newPasswordInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    formErrorField === "newPassword" && styles.inputWrapperError,
                                ]}
                            >
                                <Lock size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={newPasswordInputRef}
                                    style={styles.input}
                                    placeholder="Digite a nova senha"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={secureNewPassword}
                                    editable={!isSubmitting}
                                    accessibilityLabel="Nova senha"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setSecureNewPassword((prev) => !prev)}
                                    hitSlop={10}
                                    accessibilityRole="button"
                                    accessibilityLabel={secureNewPassword ? "Mostrar senha" : "Ocultar senha"}
                                >
                                    {secureNewPassword ? (
                                        <EyeOff size={18} color={Colors.textSecondary} />
                                    ) : (
                                        <Eye size={18} color={Colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </Pressable>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirmar nova senha</Text>
                            <Pressable
                                onPress={() => confirmPasswordInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    formErrorField === "confirmPassword" && styles.inputWrapperError,
                                ]}
                            >
                                <Lock size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={confirmPasswordInputRef}
                                    style={styles.input}
                                    placeholder="Confirme a nova senha"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={secureConfirmPassword}
                                    editable={!isSubmitting}
                                    accessibilityLabel="Confirmar nova senha"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setSecureConfirmPassword((prev) => !prev)}
                                    hitSlop={10}
                                    accessibilityRole="button"
                                    accessibilityLabel={secureConfirmPassword ? "Mostrar senha" : "Ocultar senha"}
                                >
                                    {secureConfirmPassword ? (
                                        <EyeOff size={18} color={Colors.textSecondary} />
                                    ) : (
                                        <Eye size={18} color={Colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </Pressable>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isSubmitting && styles.buttonDisabled]}
                            activeOpacity={0.85}
                            onPress={submit}
                            disabled={isSubmitting}
                            accessibilityRole="button"
                            accessibilityLabel="Salvar nova senha"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Salvar nova senha</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    flex: {
        flex: 1,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
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
        marginBottom: Spacing.lg,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    form: {
        gap: Spacing.lg,
    },

    inputGroup: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        height: 54,
    },

    inputWrapperError: {
        borderColor: Colors.danger,
    },

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: 0,
    },

    passwordToggle: {
        padding: Spacing.xs,
        alignItems: "center",
        justifyContent: "center",
    },

    button: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.sm,
        ...Shadows.md,
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
