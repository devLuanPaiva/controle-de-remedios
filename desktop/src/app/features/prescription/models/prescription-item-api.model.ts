import { MedicineApiDto, toMedicine } from '@features/medicine/models/medicine-api.model';

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
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        receivedQuantity: dto.receivedQuantity,
        deliveredQuantity: dto.deliveredQuantity,
        requestedAt: dto.requestedAt ? new Date(dto.requestedAt) : null,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}
