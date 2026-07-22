import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { AlertCircle, ChevronLeft } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { usePrescriptionScan } from "@/data/contexts/PrescriptionScanContext";
import { ApiRequestError } from "@/lib/apiFetch";
import { createPrescription } from "@/data/services/prescription.service";
import { IPatient } from "@/data/models/patient.model";
import { toCreatePrescriptionItemRequest } from "@/data/models/prescription-item.model";
import { brToIso, isPastOrPresentBrDate, isValidBrDate, isoToBr } from "@/lib/dateFormat";
import { usePrescriptionItems } from "@/features/prescriptions/hooks/usePrescriptionItems";
import { mapItemFieldErrors } from "@/features/prescriptions/utils/itemFieldErrors";
import { ExtractionBanner } from "@/features/prescriptions/components/ExtractionBanner";
import { PatientSearchField } from "@/features/prescriptions/components/PatientSearchField";
import { IssueDateField } from "@/features/prescriptions/components/IssueDateField";
import { PrescriptionItemsSection } from "@/features/prescriptions/components/PrescriptionItemsSection";
import { UploadedImagesRow } from "@/features/prescriptions/components/UploadedImagesRow";

export default function PrescriptionReview() {
    const router = useRouter();
    const { pages, extraction, uploadPages, reset } = usePrescriptionScan();

    const [selectedPatient, setSelectedPatient] = useState<IPatient | null>(null);
    const [issueDateBr, setIssueDateBr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

    const { items, initializeFromExtraction, addItem, updateItem, removeItem } = usePrescriptionItems();

    useEffect(() => {
        if (pages.length === 0) {
            router.replace("/(protected)/prescriptions" as Href);
        }
    }, [pages, router]);

    useEffect(() => {
        if (extraction?.status === "success" && extraction.data.issueDate) {
            setIssueDateBr(isoToBr(extraction.data.issueDate));
        }
    }, [extraction]);

    useEffect(() => {
        if (extraction?.status === "success") {
            initializeFromExtraction(extraction.data.medications);
        }
    }, [extraction, initializeFromExtraction]);

    if (pages.length === 0) {
        return <View style={styles.container} />;
    }

    const extractedPatientName = extraction?.status === "success" ? (extraction.data.patientName ?? "") : "";
    const canSubmit = Boolean(selectedPatient) && isValidBrDate(issueDateBr) && items.length > 0 && !isSubmitting;

    async function handleSubmit() {
        if (!selectedPatient) {
            setFormError("Selecione um paciente.");
            return;
        }

        if (!isValidBrDate(issueDateBr)) {
            setFormError("Informe uma data de emissão válida.");
            return;
        }

        if (!isPastOrPresentBrDate(issueDateBr)) {
            setFormError("A data de emissão não pode ser futura.");
            return;
        }

        if (items.length === 0) {
            setFormError("Adicione ao menos um medicamento à receita.");
            return;
        }

        try {
            setFormError(null);
            setItemErrors({});
            setIsSubmitting(true);

            const imageUrls = await uploadPages();

            if (!imageUrls) {
                setFormError("Não foi possível enviar as imagens. Tente novamente.");
                return;
            }

            await createPrescription({
                patientId: selectedPatient.id,
                issueDate: brToIso(issueDateBr),
                imageUrls,
                items: items.map(toCreatePrescriptionItemRequest),
            });

            Alert.alert("Sucesso", "Receita cadastrada com sucesso.", [
                {
                    text: "OK",
                    onPress: () => {
                        reset();
                        router.replace("/(protected)/home" as Href);
                    },
                },
            ]);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setItemErrors(mapItemFieldErrors(err.errors, items));
            } else {
                setFormError("Não foi possível cadastrar a receita.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                    >
                        <ChevronLeft size={22} color={Colors.text} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Revisar receituário</Text>
                </View>

                <ExtractionBanner extraction={extraction} />

                {formError ? (
                    <View style={styles.errorBox}>
                        <AlertCircle size={16} color={Colors.danger} />
                        <Text style={styles.errorText}>{formError}</Text>
                    </View>
                ) : null}

                <View style={styles.field}>
                    <Text style={styles.label}>Paciente</Text>
                    <PatientSearchField
                        selectedPatient={selectedPatient}
                        onSelect={setSelectedPatient}
                        onClear={() => setSelectedPatient(null)}
                        initialQuery={extractedPatientName}
                    />
                </View>

                <IssueDateField value={issueDateBr} onChange={setIssueDateBr} />

                <PrescriptionItemsSection
                    items={items}
                    onAdd={addItem}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                    itemErrors={itemErrors}
                />

                <UploadedImagesRow imageUrls={pages.map((page) => page.localUri)} />

                <TouchableOpacity
                    style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Cadastrar receita"
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Cadastrar receita</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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

    backButton: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    field: {
        gap: Spacing.xs,
    },

    label: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
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
