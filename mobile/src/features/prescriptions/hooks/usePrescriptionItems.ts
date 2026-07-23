import { useCallback, useState } from "react";

import { createLocalId } from "@/lib/createLocalId";
import { ExtractedMedication } from "@/data/services/extraction.service";
import {
    CreatePrescriptionItemRequest,
    FrequencyType,
    PrescriptionItemDraft,
    TreatmentType,
    UnityType,
} from "@/data/models/prescription-item.model";

const DEFAULT_DOSAGE = "Conforme orientação médica";
const DEFAULT_PRESCRIBED_QUANTITY = 1;
const DEFAULT_UNITY_TYPE = UnityType.TABLET;
const DEFAULT_FREQUENCY = 1;
const DEFAULT_FREQUENCY_TYPE = FrequencyType.PER_DAY;
const DEFAULT_TREATMENT_TYPE = TreatmentType.SHORT_TERM;
const DEFAULT_TREATMENT_DAYS = 1;

export const BLANK_PRESCRIPTION_ITEM: CreatePrescriptionItemRequest = {
    medicine: { name: "" },
    dosage: "",
    prescribedQuantity: DEFAULT_PRESCRIBED_QUANTITY,
    unityType: DEFAULT_UNITY_TYPE,
    frequency: DEFAULT_FREQUENCY,
    frequencyType: DEFAULT_FREQUENCY_TYPE,
    treatmentType: DEFAULT_TREATMENT_TYPE,
    treatmentDays: DEFAULT_TREATMENT_DAYS,
};

function toDraft(medication: ExtractedMedication): PrescriptionItemDraft {
    return {
        localId: medication.localId,
        medicine: {
            name: medication.name,
            eanCode: medication.eanCode ?? undefined,
        },
        dosage: medication.dosage ?? DEFAULT_DOSAGE,
        prescribedQuantity: medication.prescribedQuantity ?? DEFAULT_PRESCRIBED_QUANTITY,
        unityType: medication.unityType ?? DEFAULT_UNITY_TYPE,
        frequency: medication.frequency ?? DEFAULT_FREQUENCY,
        frequencyType: medication.frequencyType ?? DEFAULT_FREQUENCY_TYPE,
        treatmentType: medication.treatmentType ?? DEFAULT_TREATMENT_TYPE,
        treatmentDays: medication.treatmentDays ?? DEFAULT_TREATMENT_DAYS,
    };
}

interface UsePrescriptionItemsResult {
    items: PrescriptionItemDraft[];
    initializeFromExtraction: (medications: ExtractedMedication[]) => void;
    addItem: (item: CreatePrescriptionItemRequest) => void;
    updateItem: (localId: string, item: CreatePrescriptionItemRequest) => void;
    removeItem: (localId: string) => void;
}

export function usePrescriptionItems(): UsePrescriptionItemsResult {
    const [items, setItems] = useState<PrescriptionItemDraft[]>([]);

    const initializeFromExtraction = useCallback((medications: ExtractedMedication[]) => {
        setItems(medications.map(toDraft));
    }, []);

    const addItem = useCallback((item: CreatePrescriptionItemRequest) => {
        setItems((current) => [...current, { ...item, localId: createLocalId("item") }]);
    }, []);

    const updateItem = useCallback((localId: string, item: CreatePrescriptionItemRequest) => {
        setItems((current) =>
            current.map((existing) => (existing.localId === localId ? { ...item, localId } : existing)),
        );
    }, []);

    const removeItem = useCallback((localId: string) => {
        setItems((current) => current.filter((existing) => existing.localId !== localId));
    }, []);

    return { items, initializeFromExtraction, addItem, updateItem, removeItem };
}
