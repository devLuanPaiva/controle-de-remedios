export enum UnityType {
    BOX = "BOX",
    BLISTER = "BLISTER",
    BOTTLE = "BOTTLE",
    TABLET = "TABLET",
    CAPSULE = "CAPSULE",
    SYRUP = "SYRUP",
}

export const UnityTypeLabels: Record<UnityType, string> = {
    [UnityType.BOX]: "Caixa",
    [UnityType.BLISTER]: "Blister",
    [UnityType.BOTTLE]: "Frasco",
    [UnityType.TABLET]: "Comprimido",
    [UnityType.CAPSULE]: "Cápsula",
    [UnityType.SYRUP]: "Xarope",
};

export enum FrequencyType {
    PER_DAY = "PER_DAY",
    PER_WEEK = "PER_WEEK",
    PER_MONTH = "PER_MONTH",
}

export const FrequencyTypeLabels: Record<FrequencyType, string> = {
    [FrequencyType.PER_DAY]: "Por dia",
    [FrequencyType.PER_WEEK]: "Por semana",
    [FrequencyType.PER_MONTH]: "Por mês",
};

export enum TreatmentType {
    CONTINUOUS = "CONTINUOUS",
    SHORT_TERM = "SHORT_TERM",
    LONG_TERM = "LONG_TERM",
}

export const TreatmentTypeLabels: Record<TreatmentType, string> = {
    [TreatmentType.CONTINUOUS]: "Contínuo",
    [TreatmentType.SHORT_TERM]: "Curto prazo",
    [TreatmentType.LONG_TERM]: "Longo prazo",
};

export interface CreatePrescriptionItemMedicineRequest {
    name: string;
    eanCode?: string;
    imageUrl?: string;
}

export interface CreatePrescriptionItemRequest {
    medicine: CreatePrescriptionItemMedicineRequest;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
}

export interface PrescriptionItemDraft extends CreatePrescriptionItemRequest {
    localId: string;
}

export function toCreatePrescriptionItemRequest(draft: PrescriptionItemDraft): CreatePrescriptionItemRequest {
    return {
        medicine: draft.medicine,
        dosage: draft.dosage,
        prescribedQuantity: draft.prescribedQuantity,
        unityType: draft.unityType,
        frequency: draft.frequency,
        frequencyType: draft.frequencyType,
        treatmentType: draft.treatmentType,
        treatmentDays: draft.treatmentDays,
    };
}
