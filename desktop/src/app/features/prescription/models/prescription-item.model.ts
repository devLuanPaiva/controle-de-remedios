import { IMedicine } from '@features/medicine/models/medicine.model';

import { PrescriptionStatus } from './prescription.model';

export enum UnityType {
    BOX = 'BOX',
    BLISTER = 'BLISTER',
    BOTTLE = 'BOTTLE',
    TABLET = 'TABLET',
    CAPSULE = 'CAPSULE',
    SYRUP = 'SYRUP',
}

export const UnityTypeLabels: Record<UnityType, string> = {
    [UnityType.BOX]: 'Caixa',
    [UnityType.BLISTER]: 'Blister',
    [UnityType.BOTTLE]: 'Frasco',
    [UnityType.TABLET]: 'Comprimido',
    [UnityType.CAPSULE]: 'Cápsula',
    [UnityType.SYRUP]: 'Xarope',
};

export enum FrequencyType {
    PER_DAY = 'PER_DAY',
    PER_WEEK = 'PER_WEEK',
    PER_MONTH = 'PER_MONTH',
}

export const FrequencyTypeLabels: Record<FrequencyType, string> = {
    [FrequencyType.PER_DAY]: 'Por dia',
    [FrequencyType.PER_WEEK]: 'Por semana',
    [FrequencyType.PER_MONTH]: 'Por mês',
};

export enum TreatmentType {
    CONTINUOUS = 'CONTINUOUS',
    SHORT_TERM = 'SHORT_TERM',
    LONG_TERM = 'LONG_TERM',
}

export const TreatmentTypeLabels: Record<TreatmentType, string> = {
    [TreatmentType.CONTINUOUS]: 'Contínuo',
    [TreatmentType.SHORT_TERM]: 'Curto prazo',
    [TreatmentType.LONG_TERM]: 'Longo prazo',
};

export interface IPrescriptionItem {
    id: string;
    prescriptionId: string;
    medicine: IMedicine;
    status: PrescriptionStatus;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
    observations: string | null;
    startDate: Date | null;
    receivedQuantity: number | null;
    deliveredQuantity: number | null;
    requestedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
