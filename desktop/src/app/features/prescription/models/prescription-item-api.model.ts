import { MedicineApiDto, toMedicine } from '@features/medicine/models/medicine-api.model';
import { parseLocalDate } from '@shared/utils/date.util';

import { PrescriptionStatus } from './prescription.model';
import { FrequencyType, IPrescriptionItem, TreatmentType, UnityType } from './prescription-item.model';

export interface PrescriptionItemApiDto {
    id: string;
    prescriptionId: string;
    medicine: MedicineApiDto;
    status: PrescriptionStatus;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
    observations: string | null;
    startDate: string | null;
    receivedQuantity: number | null;
    deliveredQuantity: number | null;
    requestedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePrescriptionItemMedicine {
    name: string;
    eanCode?: string;
    imageUrl?: string;
}

export interface CreatePrescriptionItemRequest {
    medicineId?: string;
    medicine?: CreatePrescriptionItemMedicine;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
}

/**
 * Draft variant used while a prescription is being assembled in the create form: a
 * quick-created medicine carries a pending `imageFile` instead of an already-uploaded
 * `imageUrl`, since the upload only happens when the whole prescription is submitted.
 */
export interface CreatePrescriptionItemMedicineDraft {
    name: string;
    eanCode?: string;
    imageFile?: File;
}

export interface CreatePrescriptionItemRequestDraft {
    medicineId?: string;
    medicine?: CreatePrescriptionItemMedicineDraft;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
}

export interface UpdatePrescriptionItemRequest {
    status?: PrescriptionStatus;
    dosage?: string;
    prescribedQuantity?: number;
    unityType?: UnityType;
    frequency?: number;
    frequencyType?: FrequencyType;
    treatmentType?: TreatmentType;
    treatmentDays?: number;
    observations?: string;
    startDate?: string;
    receivedQuantity?: number;
    deliveredQuantity?: number;
}

export function toPrescriptionItem(dto: PrescriptionItemApiDto): IPrescriptionItem {
    return {
        id: dto.id,
        prescriptionId: dto.prescriptionId,
        medicine: toMedicine(dto.medicine),
        status: dto.status,
        dosage: dto.dosage,
        prescribedQuantity: dto.prescribedQuantity,
        unityType: dto.unityType,
        frequency: dto.frequency,
        frequencyType: dto.frequencyType,
        treatmentType: dto.treatmentType,
        treatmentDays: dto.treatmentDays,
        observations: dto.observations,
        startDate: dto.startDate ? parseLocalDate(dto.startDate) : null,
        receivedQuantity: dto.receivedQuantity,
        deliveredQuantity: dto.deliveredQuantity,
        requestedAt: dto.requestedAt ? new Date(dto.requestedAt) : null,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}
