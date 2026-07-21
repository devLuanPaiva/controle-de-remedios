import { useRef } from "react";
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
import { useRouter, type Href } from "expo-router";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react-native";

import { Wave } from "@/components/shared/Wave";
import { BackButton } from "@/components/shared/BackButton";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

export default function ForgotPassword() {
    const router = useRouter();
    const { email, setEmail, isSubmitting, formError, isSubmitted, submit } = useForgotPassword();
    const emailInputRef = useRef<TextInput>(null);

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
                    {isSubmitted ? (
                        <View style={styles.successBlock}>
                            <View style={styles.successIconBadge}>
                                <CheckCircle2 size={40} color={Colors.success} />
                            </View>
                            <Text style={[styles.title, styles.textCenter]}>Verifique seu e-mail</Text>
                            <Text style={[styles.subtitle, styles.textCenter]}>
                                Se o e-mail informado estiver cadastrado, você receberá as instruções para
                                redefinição de senha.
                            </Text>

                            <TouchableOpacity
                                style={styles.button}
                                activeOpacity={0.85}
                                onPress={() => router.replace("/(authentication)/signIn" as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Voltar para o login"
                            >
                                <Text style={styles.buttonText}>Voltar para o login</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.textBlock}>
                                <Text style={styles.title}>Esqueci minha senha</Text>
                                <Text style={styles.subtitle}>
                                    Informe o e-mail cadastrado para receber as instruções de redefinição de senha.
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
                                    <Text style={styles.label}>E-mail</Text>
                                    <Pressable
                                        onPress={() => emailInputRef.current?.focus()}
                                        style={styles.inputWrapper}
                                    >
                                        <Mail size={18} color={Colors.textSecondary} />
                                        <TextInput
                                            ref={emailInputRef}
                                            style={styles.input}
                                            placeholder="Digite seu e-mail"
                                            placeholderTextColor={Colors.textSecondary}
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType="email-address"
                                            editable={!isSubmitting}
                                            accessibilityLabel="E-mail"
                                        />
                                    </Pressable>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                                    activeOpacity={0.85}
                                    onPress={submit}
                                    disabled={isSubmitting}
                                    accessibilityRole="button"
                                    accessibilityLabel="Enviar instruções"
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color={Colors.white} />
                                    ) : (
                                        <Text style={styles.buttonText}>Enviar instruções</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    activeOpacity={0.7}
                                    onPress={() => router.replace("/(authentication)/signIn" as Href)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Voltar para o login"
                                >
                                    <Text style={styles.linkText}>Voltar para o login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
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

    input: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: 0,
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

    linkButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.sm,
    },

    linkText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },

    successBlock: {
        gap: Spacing.sm,
        paddingTop: Spacing.xl,
    },

    textCenter: {
        textAlign: "center",
    },

    successIconBadge: {
        alignSelf: "center",
        width: 72,
        height: 72,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.success}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },
});
