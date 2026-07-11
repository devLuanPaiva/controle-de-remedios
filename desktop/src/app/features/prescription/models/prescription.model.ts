import { IPatient } from '@features/patient/models/patient.model';

export enum PrescriptionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DELIVERED = 'DELIVERED',
    PARTIAL_DELIVERED = 'PARTIAL_DELIVERED',
}

export const PrescriptionStatusLabels: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: 'Pendente',
    [PrescriptionStatus.APPROVED]: 'Aprovada',
    [PrescriptionStatus.REJECTED]: 'Rejeitada',
    [PrescriptionStatus.DELIVERED]: 'Entregue',
    [PrescriptionStatus.PARTIAL_DELIVERED]: 'Entrega parcial',
};

export interface IPrescriptionPatientSummary {
    id: string;
    name: string;
}

export interface IPrescription {
    id: string;
    status: PrescriptionStatus;
    imageUrl?: string;
    issueDate: Date;
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPrescriptionListItem extends IPrescription {
    patient: IPrescriptionPatientSummary;
}

export interface IPrescriptionDetail extends IPrescription {
    patient: IPatient;
}
