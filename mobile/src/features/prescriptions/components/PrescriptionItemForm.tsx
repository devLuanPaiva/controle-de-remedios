import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { ChipSelector } from "@/components/shared/ChipSelector";
import {
    CreatePrescriptionItemRequest,
    FrequencyType,
    FrequencyTypeLabels,
    TreatmentType,
    TreatmentTypeLabels,
    UnityType,
    UnityTypeLabels,
} from "@/data/models/prescription-item.model";
import { BLANK_PRESCRIPTION_ITEM } from "@/features/prescriptions/hooks/usePrescriptionItems";

const UNITY_OPTIONS = Object.values(UnityType).map((value) => ({ value, label: UnityTypeLabels[value] }));
const FREQUENCY_OPTIONS = Object.values(FrequencyType).map((value) => ({ value, label: FrequencyTypeLabels[value] }));
const TREATMENT_OPTIONS = Object.values(TreatmentType).map((value) => ({ value, label: TreatmentTypeLabels[value] }));

interface PrescriptionItemFormProps {
    visible: boolean;
    title: string;
    initialValue: CreatePrescriptionItemRequest | null;
    onSave: (item: CreatePrescriptionItemRequest) => void;
    onCancel: () => void;
}

function toFormState(item: CreatePrescriptionItemRequest) {
    return {
        name: item.medicine.name,
        eanCode: item.medicine.eanCode ?? "",
        imageUrl: item.medicine.imageUrl,
        dosage: item.dosage,
        prescribedQuantity: String(item.prescribedQuantity),
        unityType: item.unityType,
        frequency: String(item.frequency),
        frequencyType: item.frequencyType,
        treatmentType: item.treatmentType,
        treatmentDays: String(item.treatmentDays),
    };
}

type FormState = ReturnType<typeof toFormState>;

function toPayload(form: FormState): CreatePrescriptionItemRequest | null {
    const prescribedQuantity = Number(form.prescribedQuantity);
    const frequency = Number(form.frequency);
    const treatmentDays = Number(form.treatmentDays);

    if (!form.name.trim() || !form.dosage.trim()) {
        return null;
    }

    if (!prescribedQuantity || prescribedQuantity <= 0 || !frequency || frequency <= 0) {
        return null;
    }

    if (!treatmentDays || treatmentDays <= 0) {
        return null;
    }

    return {
        medicine: {
            name: form.name.trim(),
            eanCode: form.eanCode.trim() || undefined,
            imageUrl: form.imageUrl,
        },
        dosage: form.dosage.trim(),
        prescribedQuantity,
        unityType: form.unityType,
        frequency,
        frequencyType: form.frequencyType,
        treatmentType: form.treatmentType,
        treatmentDays,
    };
}

export function PrescriptionItemForm({
    visible,
    title,
    initialValue,
    onSave,
    onCancel,
}: Readonly<PrescriptionItemFormProps>) {
    const [form, setForm] = useState<FormState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setForm(toFormState(initialValue ?? BLANK_PRESCRIPTION_ITEM));
            setError(null);
        }
    }, [visible, initialValue]);

    if (!form) {
        return null;
    }

    function updateForm(patch: Partial<FormState>): void {
        setForm((current) => (current ? { ...current, ...patch } : current));
    }

    function handleSave(): void {
        const payload = toPayload(form!);

        if (!payload) {
            setError("Preencha nome, dosagem e valores válidos (maiores que zero) para quantidade, frequência e dias.");
            return;
        }

        onSave(payload);
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onCancel}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar formulário"
                    >
                        <X size={20} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.field}>
                        <Text style={styles.label}>Nome do medicamento</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Losartana Potássica"
                            placeholderTextColor={Colors.textSecondary}
                            value={form.name}
                            onChangeText={(text) => updateForm({ name: text })}
                            accessibilityLabel="Nome do medicamento"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Código EAN (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Código de barras"
                            placeholderTextColor={Colors.textSecondary}
                            value={form.eanCode}
                            onChangeText={(text) => updateForm({ eanCode: text })}
                            keyboardType="numeric"
                            accessibilityLabel="Código EAN do medicamento"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Dosagem</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 500mg"
                            placeholderTextColor={Colors.textSecondary}
                            value={form.dosage}
                            onChangeText={(text) => updateForm({ dosage: text })}
                            accessibilityLabel="Dosagem do medicamento"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.field, styles.rowField]}>
                            <Text style={styles.label}>Quantidade prescrita</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={Colors.textSecondary}
                                value={form.prescribedQuantity}
                                onChangeText={(text) => updateForm({ prescribedQuantity: text.replace(/\D/g, "") })}
                                keyboardType="number-pad"
                                accessibilityLabel="Quantidade prescrita"
                            />
                        </View>

                        <View style={[styles.field, styles.rowField]}>
                            <Text style={styles.label}>Dias de tratamento</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={Colors.textSecondary}
                                value={form.treatmentDays}
                                onChangeText={(text) => updateForm({ treatmentDays: text.replace(/\D/g, "") })}
                                keyboardType="number-pad"
                                accessibilityLabel="Dias de tratamento"
                            />
                        </View>
                    </View>

                    <ChipSelector
                        label="Unidade"
                        options={UNITY_OPTIONS}
                        value={form.unityType}
                        onChange={(value) => updateForm({ unityType: value })}
                    />

                    <View style={styles.row}>
                        <View style={[styles.field, styles.rowField]}>
                            <Text style={styles.label}>Frequência</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={Colors.textSecondary}
                                value={form.frequency}
                                onChangeText={(text) => updateForm({ frequency: text.replace(/\D/g, "") })}
                                keyboardType="number-pad"
                                accessibilityLabel="Frequência de uso"
                            />
                        </View>
                    </View>

                    <ChipSelector
                        label="Tipo de frequência"
                        options={FREQUENCY_OPTIONS}
                        value={form.frequencyType}
                        onChange={(value) => updateForm({ frequencyType: value })}
                    />

                    <ChipSelector
                        label="Tipo de tratamento"
                        options={TREATMENT_OPTIONS}
                        value={form.treatmentType}
                        onChange={(value) => updateForm({ treatmentType: value })}
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Salvar medicamento"
                    >
                        <Text style={styles.saveButtonText}>Salvar medicamento</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    closeButton: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    content: {
        padding: Spacing.xl,
        paddingTop: 0,
        gap: Spacing.lg,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    field: {
        gap: Spacing.xs,
    },

    row: {
        flexDirection: "row",
        gap: Spacing.md,
    },

    rowField: {
        flex: 1,
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
        height: 50,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    footer: {
        padding: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },

    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
        ...Shadows.md,
    },

    saveButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
