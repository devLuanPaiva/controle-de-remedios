import { useRef, useState } from "react";
import {
    ActivityIndicator,
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
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { AlertCircle, Eye, EyeOff, KeyRound, Lock } from "lucide-react-native";

import { Wave } from "@/components/shared/Wave";
import { BackButton } from "@/components/shared/BackButton";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

export default function ResetPassword() {
    const router = useRouter();
    const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();

    const {
        token,
        setToken,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        isSubmitting,
        formError,
        formErrorField,
        submit,
    } = useResetPassword({
        initialToken: tokenParam ?? "",
        onSuccess: () => {
            router.replace({
                pathname: "/(authentication)/signIn",
                params: { resetSuccess: "1" },
            } as unknown as Href);
        },
    });

    const tokenInputRef = useRef<TextInput>(null);
    const newPasswordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const [secureNewPassword, setSecureNewPassword] = useState(true);
    const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <View style={styles.backButtonWrapper}>
                    <BackButton variant="onDark" />
                </View>

                <View style={styles.logoBadge}>
                    <Image
                        source={require("../../../assets/logos/icon-logo-white.png")}
                        style={styles.logo}
                        contentFit="contain"
                    />
                </View>
                <Wave style={styles.wave} />
            </View>

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <SafeAreaView style={styles.content} edges={[]}>
                    <View style={styles.textBlock}>
                        <Text style={styles.title}>Redefinir senha</Text>
                        <Text style={styles.subtitle}>
                            Informe o código recebido por e-mail e escolha uma nova senha.
                        </Text>
                    </View>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={18} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Código de redefinição</Text>
                            <Pressable
                                onPress={() => tokenInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    formErrorField === "token" && styles.inputWrapperError,
                                ]}
                            >
                                <KeyRound size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={tokenInputRef}
                                    style={styles.input}
                                    placeholder="Cole aqui o código recebido"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={token}
                                    onChangeText={setToken}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isSubmitting}
                                    accessibilityLabel="Código de redefinição"
                                />
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
                            accessibilityLabel="Redefinir senha"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Redefinir senha</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Spacing[10],
        paddingBottom: Spacing.xxl,
        overflow: "hidden",
    },

    backButtonWrapper: {
        position: "absolute",
        top: Spacing[10],
        left: Spacing.xl,
        zIndex: 1,
    },

    logoBadge: {
        width: 88,
        height: 88,
        borderRadius: Radius.full,
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.xxl,
    },

    logo: {
        width: 56,
        height: 56,
    },

    wave: {
        position: "absolute",
        bottom: -1,
        left: 0,
    },

    scrollContent: {
        flexGrow: 1,
    },

    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },

    textBlock: {
        marginBottom: Spacing.xl,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
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
