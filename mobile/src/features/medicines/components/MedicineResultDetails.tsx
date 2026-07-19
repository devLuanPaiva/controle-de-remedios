import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { CheckCircle2, Pencil } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IMedicine } from "@/data/models/medicine.model";
import { BackButton } from "@/components/shared/BackButton";

interface MedicineResultDetailsProps {
    medicine: IMedicine;
    eanCode: string;
    isEditing: boolean;
    name: string;
    onChangeName: (name: string) => void;
    previewUri?: string;
    formError: string | null;
    formErrorField?: string;
    hasChanges: boolean;
    isSaving: boolean;
    onEditPhoto: () => void;
    onStartEdit: () => void;
    onSave: () => void;
    onFinish: () => void;
}

export function MedicineResultDetails({
    medicine,
    eanCode,
    isEditing,
    name,
    onChangeName,
    previewUri,
    formError,
    formErrorField,
    hasChanges,
    isSaving,
    onEditPhoto,
    onStartEdit,
    onSave,
    onFinish,
}: Readonly<MedicineResultDetailsProps>) {
    return (
        <>
            <View style={styles.header}>
                <BackButton onPress={onFinish} />
                <Text style={styles.title}>Medicamento encontrado</Text>
            </View>

            <View style={styles.badge}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={styles.badgeText}>Já cadastrado</Text>
            </View>

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <View style={styles.previewRow}>
                <View style={styles.previewWrapper}>
                    {previewUri ? (
                        <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
                    ) : (
                        <View style={[styles.preview, styles.previewPlaceholder]} />
                    )}

                    {isEditing ? (
                        <TouchableOpacity
                            style={styles.changePhotoButton}
                            onPress={onEditPhoto}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Trocar foto do medicamento"
                        >
                            <Text style={styles.changePhotoText}>Trocar foto</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Nome do medicamento</Text>
                {isEditing ? (
                    <TextInput
                        style={[styles.input, formErrorField === "name" && styles.inputError]}
                        value={name}
                        onChangeText={onChangeName}
                    />
                ) : (
                    <Text style={styles.value}>{medicine.name}</Text>
                )}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Código de barras (EAN)</Text>
                <Text style={styles.readOnlyValue}>{eanCode}</Text>
            </View>

            {isEditing ? (
                <TouchableOpacity
                    style={[styles.submitButton, (!hasChanges || isSaving) && styles.submitButtonDisabled]}
                    onPress={onSave}
                    disabled={!hasChanges || isSaving}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Salvar alterações"
                >
                    {isSaving ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Salvar alterações</Text>
                    )}
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onStartEdit}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Editar nome ou imagem"
                    >
                        <Pencil size={16} color={Colors.primary} />
                        <Text style={styles.editButtonText}>Editar nome ou imagem</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={onFinish}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Concluído"
                    >
                        <Text style={styles.submitButtonText}>Concluído</Text>
                    </TouchableOpacity>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
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

    badge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: Spacing.xs,
        backgroundColor: `${Colors.success}1A`,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    badgeText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.success,
    },

    previewRow: {
        alignItems: "center",
    },

    previewWrapper: {
        width: 160,
        height: 220,
    },

    preview: {
        width: 160,
        height: 220,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surface,
    },

    previewPlaceholder: {
        borderWidth: 1,
        borderColor: Colors.border,
    },

    changePhotoButton: {
        position: "absolute",
        right: Spacing.md,
        bottom: Spacing.md,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },

    changePhotoText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    value: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
        paddingVertical: Spacing.sm,
    },

    readOnlyValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        paddingVertical: Spacing.sm,
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

    inputError: {
        borderColor: Colors.danger,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: Radius.full,
        height: 48,
    },

    editButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
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
