import { apiFetch } from "@/lib/apiFetch";
import { createLocalId } from "@/lib/createLocalId";
import { FrequencyType, TreatmentType, UnityType } from "@/data/models/prescription-item.model";

export type PrescriptionType = "DIGITAL" | "HANDWRITTEN";

export interface ExtractedMedication {
    localId: string;
    name: string;
    eanCode: string | null;
    dosage: string | null;
    prescribedQuantity: number | null;
    unityType: UnityType | null;
    frequency: number | null;
    frequencyType: FrequencyType | null;
    treatmentType: TreatmentType | null;
    treatmentDays: number | null;
}

export interface ExtractedPrescriptionData {
    patientName: string | null;
    issueDate: string | null;
    medications: ExtractedMedication[];
}

export type ExtractionResult =
    | { status: "success"; data: ExtractedPrescriptionData }
    | { status: "unavailable" };

export type BarcodeExtractionResult = { status: "success"; eanCode: string } | { status: "unavailable" };

export type MedicineNameExtractionResult = { status: "success"; name: string } | { status: "unavailable" };

interface ExtractedMedicationDto {
    name: string;
    eanCode: string | null;
    dosage: string | null;
    prescribedQuantity: number | null;
    unityType: UnityType | null;
    frequency: number | null;
    frequencyType: FrequencyType | null;
    treatmentType: TreatmentType | null;
    treatmentDays: number | null;
}

interface PrescriptionExtractionResponseDto {
    available: boolean;
    patientName: string | null;
    issueDate: string | null;
    medications: ExtractedMedicationDto[];
}

interface BarcodeExtractionResponseDto {
    available: boolean;
    eanCode: string | null;
}

interface MedicineNameExtractionResponseDto {
    available: boolean;
    name: string | null;
}

const PRESCRIPTION_EXTRACTION_ENDPOINT_BY_TYPE: Record<PrescriptionType, string> = {
    DIGITAL: "/ai/prescriptions/esus",
    HANDWRITTEN: "/ai/prescriptions/digitalized",
};

export async function extractPrescriptionData(
    pages: { base64: string }[],
    type: PrescriptionType,
): Promise<ExtractionResult> {
    if (pages.length === 0) {
        return { status: "unavailable" };
    }

    try {
        const response = await apiFetch<PrescriptionExtractionResponseDto>(
            PRESCRIPTION_EXTRACTION_ENDPOINT_BY_TYPE[type],
            {
                method: "POST",
                body: JSON.stringify({ images: pages.map((page) => page.base64) }),
            },
        );

        if (!response.data.available) {
            return { status: "unavailable" };
        }

        return {
            status: "success",
            data: {
                patientName: response.data.patientName,
                issueDate: response.data.issueDate,
                medications: response.data.medications.map((medication) => ({
                    ...medication,
                    localId: createLocalId("medication"),
                })),
            },
        };
    } catch {
        return { status: "unavailable" };
    }
}

export async function extractBarcodeValue(base64: string): Promise<BarcodeExtractionResult> {
    try {
        const response = await apiFetch<BarcodeExtractionResponseDto>("/ai/medicines/barcode", {
            method: "POST",
            body: JSON.stringify({ image: base64 }),
        });

        return response.data.available && response.data.eanCode
            ? { status: "success", eanCode: response.data.eanCode }
            : { status: "unavailable" };
    } catch {
        return { status: "unavailable" };
    }
}

export async function extractMedicineName(base64: string): Promise<MedicineNameExtractionResult> {
    try {
        const response = await apiFetch<MedicineNameExtractionResponseDto>("/ai/medicines/name", {
            method: "POST",
            body: JSON.stringify({ image: base64 }),
        });

        return response.data.available && response.data.name
            ? { status: "success", name: response.data.name }
            : { status: "unavailable" };
    } catch {
        return { status: "unavailable" };
    }
}
