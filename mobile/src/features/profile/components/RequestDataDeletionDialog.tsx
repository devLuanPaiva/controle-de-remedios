import { AlertCircle } from "lucide-react-native";
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

import { useRequestDataDeletion } from "@/features/auth/hooks/useRequestDataDeletion";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface RequestDataDeletionDialogProps {
    visible: boolean;
    onCancel: () => void;
    onRequested: () => void;
}

export function RequestDataDeletionDialog({
    visible,
    onCancel,
    onRequested,
}: Readonly<RequestDataDeletionDialogProps>) {
    const { message, setMessage, isSubmitting, formError, submit, reset } = useRequestDataDeletion({
        onSuccess: onRequested,
    });

    function handleCancel() {
        reset();
        onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <Pressable style={styles.backdrop} onPress={handleCancel} accessibilityLabel="Fechar">
                <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.title}>Solicitar exclusão de dados</Text>
                    <Text style={styles.message}>
                        Dados de pacientes, prescrições e entregas vinculados à empresa não são apagados
                        automaticamente ao excluir sua conta. Envie uma solicitação e nossa equipe responderá em até
                        15 dias úteis.
                    </Text>

                    {formError ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{formError}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Descreva o que deseja que seja excluído (opcional)"
                        placeholderTextColor={Colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        editable={!isSubmitting}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        accessibilityLabel="Mensagem"
                    />

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
                            style={[styles.button, styles.confirmButton, isSubmitting && styles.buttonDisabled]}
                            onPress={submit}
                            activeOpacity={0.85}
                            disabled={isSubmitting}
                            accessibilityRole="button"
                            accessibilityLabel="Enviar solicitação"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.confirmLabel}>Enviar</Text>
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

    input: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        height: 96,
        marginTop: Spacing.lg,
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

    confirmButton: {
        backgroundColor: Colors.primary,
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
