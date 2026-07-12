import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import { AlertCircle } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { usePrescriptionScan } from "@/data/contexts/PrescriptionScanContext";
import { ApiRequestError } from "@/lib/apiFetch";
import { createPrescription } from "@/data/services/prescription.service";
import { IPatient } from "@/data/models/patient.model";
import { brToIso, isPastOrPresentBrDate, isValidBrDate, isoToBr } from "@/lib/dateFormat";
import { ExtractionBanner } from "@/features/prescriptions/components/ExtractionBanner";
import { PatientSearchField } from "@/features/prescriptions/components/PatientSearchField";
import { IssueDateField } from "@/features/prescriptions/components/IssueDateField";
import { MedicationsReadOnlyList } from "@/features/prescriptions/components/MedicationsReadOnlyList";
import { UploadedImagesRow } from "@/features/prescriptions/components/UploadedImagesRow";

export default function PrescriptionReview() {
    const router = useRouter();
    const { uploadedImageUrls, extraction, reset } = usePrescriptionScan();

    const [selectedPatient, setSelectedPatient] = useState<IPatient | null>(null);
    const [issueDateBr, setIssueDateBr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!uploadedImageUrls) {
            router.replace("/(protected)/prescriptions" as Href);
        }
    }, [uploadedImageUrls, router]);

    useEffect(() => {
        if (extraction?.status === "success" && extraction.data.issueDate) {
            setIssueDateBr(isoToBr(extraction.data.issueDate));
        }
    }, [extraction]);

    if (!uploadedImageUrls) {
        return <View style={styles.container} />;
    }

    const extractedPatientName = extraction?.status === "success" ? (extraction.data.patientName ?? "") : "";
    const medications = extraction?.status === "success" ? extraction.data.medications : [];
    const canSubmit = Boolean(selectedPatient) && isValidBrDate(issueDateBr) && !isSubmitting;

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

        try {
            setFormError(null);
            setIsSubmitting(true);

            await createPrescription({
                patientId: selectedPatient.id,
                issueDate: brToIso(issueDateBr),
                imageUrls: uploadedImageUrls ?? undefined,
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
            setFormError(err instanceof ApiRequestError ? err.message : "Não foi possível cadastrar a receita.");
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
                <Text style={styles.title}>Revisar receituário</Text>

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

                <MedicationsReadOnlyList medications={medications} />

                <UploadedImagesRow imageUrls={uploadedImageUrls} />

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
