import { PatientApiDto, toPatient } from '@features/patient/models/patient-api.model';

import {
    IPrescription,
    IPrescriptionDetail,
    IPrescriptionListItem,
    IPrescriptionPatientSummary,
    PrescriptionStatus,
} from './prescription.model';

export interface PrescriptionApiDto {
    id: string;
    status: PrescriptionStatus;
    imageUrl: string | null;
    issueDate: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PrescriptionListItemApiDto extends PrescriptionApiDto {
    patient: IPrescriptionPatientSummary;
}

export interface PrescriptionDetailApiDto extends PrescriptionApiDto {
    patient: PatientApiDto;
}

export interface CreatePrescriptionRequest {
    imageUrl?: string;
    issueDate: string;
    patientId: string;
}

export interface UpdatePrescriptionRequest {
    status?: PrescriptionStatus;
    imageUrl?: string;
    issueDate?: string;
}

export interface PrescriptionFilterParams {
    patientId?: string;
    patientName?: string;
    patientCpf?: string;
    status?: PrescriptionStatus;
    issueDate?: string;
}

export interface PrescriptionsPage {
    prescriptions: IPrescriptionListItem[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toPrescription(dto: PrescriptionApiDto): IPrescription {
    return {
        id: dto.id,
        status: dto.status,
        imageUrl: dto.imageUrl ?? undefined,
        issueDate: new Date(dto.issueDate),
        patientId: dto.patientId,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export function toPrescriptionListItem(dto: PrescriptionListItemApiDto): IPrescriptionListItem {
    return {
        ...toPrescription(dto),
        patient: dto.patient,
    };
}

export function toPrescriptionDetail(dto: PrescriptionDetailApiDto): IPrescriptionDetail {
    return {
        ...toPrescription(dto),
        patient: toPatient(dto.patient),
    };
}
