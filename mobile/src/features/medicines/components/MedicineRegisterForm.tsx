import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { AlertCircle } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { CapturedPhoto, LookupState } from "@/data/contexts/MedicineScanContext";
import { BackButton } from "@/components/shared/BackButton";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";

interface MedicineRegisterFormProps {
    boxPhoto: CapturedPhoto;
    extractedName: string | null;
    isExtractingName: boolean;
    lookup: LookupState;
    name: string;
    onChangeName: (name: string) => void;
    formError: string | null;
    isSubmitting: boolean;
    onRetake: () => void;
    onSubmit: () => void;
}

export function MedicineRegisterForm({
    boxPhoto,
    extractedName,
    isExtractingName,
    lookup,
    name,
    onChangeName,
    formError,
    isSubmitting,
    onRetake,
    onSubmit,
}: Readonly<MedicineRegisterFormProps>) {
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <BackButton onPress={onRetake} />
                        <Text style={styles.title}>Cadastrar medicamento</Text>
                    </View>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <View style={styles.previewRow}>
                        <Image source={{ uri: boxPhoto.localUri }} style={styles.preview} contentFit="cover" />
                    </View>

                    {!isExtractingName && !extractedName ? (
                        <Text style={styles.warning}>
                            Não conseguimos identificar o nome automaticamente. Digite manualmente abaixo.
                        </Text>
                    ) : null}

                    <View style={styles.field}>
                        <Text style={styles.label}>Nome do medicamento</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={onChangeName}
                            placeholder="Ex: Dipirona 500mg"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {lookup.status === "not_found" ? (
                        <View style={styles.field}>
                            <Text style={styles.label}>Código de barras (EAN)</Text>
                            <Text style={styles.readOnlyValue}>{lookup.eanCode}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.submitButton, (!name.trim() || isSubmitting) && styles.submitButtonDisabled]}
                        onPress={onSubmit}
                        disabled={!name.trim() || isSubmitting}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar medicamento"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Cadastrar medicamento</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <ProcessingOverlay
                visible={isExtractingName}
                uploadLabel={null}
                title="Analisando embalagem"
                defaultUploadLabel="Identificando o nome do medicamento..."
                secondaryLabel="Isso leva só um instante."
            />
        </KeyboardAvoidingView>
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
        gap: Spacing.lg,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    previewRow: {
        alignItems: "center",
    },

    preview: {
        width: 160,
        height: 220,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surface,
    },

    warning: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.warning,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    readOnlyValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        paddingVertical: Spacing.sm,
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
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.sm,
        ...Shadows.md,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
