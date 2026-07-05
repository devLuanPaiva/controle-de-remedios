import { useAuth } from "@/data/contexts/AuthContext";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
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
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { Wave } from "@/components/shared/Wave";

export default function SignIn() {
    const { login } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const usernameInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    async function handleLogin() {
        if (!username.trim() || !password.trim()) {
            setError("Preencha nome de usuário e senha.");
            return;
        }

        try {
            setError(null);
            setIsLoading(true);
            await login(username.trim(), password);
            router.replace("/(protected)/home");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao realizar login.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <View style={styles.logoBadge}>
                    <Image
                        source={require("../../../assets/logos/icon-logo-white.png")}
                        style={styles.logo}
                        contentFit="contain"
                    />
                </View>
                <Wave style={styles.wave}  />
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
                        <Text style={styles.title}>Bem-vindo de volta</Text>
                        <Text style={styles.subtitle}>
                            Entre com sua conta para continuar
                        </Text>
                    </View>

                    {error ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={18} color={Colors.danger} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail</Text>
                            <Pressable
                                onPress={() => usernameInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    focusedInput === "username" && styles.inputWrapperFocused,
                                ]}
                            >
                                <Mail size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={usernameInputRef}
                                    style={styles.input}
                                    placeholder="Digite seu e-mail"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={username}
                                    onChangeText={setUsername}
                                    onFocus={() => setFocusedInput("username")}
                                    onBlur={() => setFocusedInput(null)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    accessibilityLabel="Usuário"
                                />
                            </Pressable>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Senha</Text>
                            <Pressable
                                onPress={() => passwordInputRef.current?.focus()}
                                style={[
                                    styles.inputWrapper,
                                    focusedInput === "password" && styles.inputWrapperFocused,
                                ]}
                            >
                                <Lock size={18} color={Colors.textSecondary} />
                                <TextInput
                                    ref={passwordInputRef}
                                    style={styles.input}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedInput("password")}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={secure}
                                    editable={!isLoading}
                                    accessibilityLabel="Senha"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setSecure((prev) => !prev)}
                                    hitSlop={10}
                                    accessibilityRole="button"
                                    accessibilityLabel={secure ? "Mostrar senha" : "Ocultar senha"}
                                >
                                    {secure ? (
                                        <EyeOff size={18} color={Colors.textSecondary} />
                                    ) : (
                                        <Eye size={18} color={Colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </Pressable>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            activeOpacity={0.85}
                            onPress={handleLogin}
                            disabled={isLoading}
                            accessibilityRole="button"
                            accessibilityLabel="Entrar"
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Entrar</Text>
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

    inputWrapperFocused: {
        borderColor: Colors.primary,
        ...Shadows.sm,
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
