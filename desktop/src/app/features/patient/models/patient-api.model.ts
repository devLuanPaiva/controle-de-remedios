import { parseLocalDate } from '@shared/utils/date.util';

import { IPatient } from './patient.model';

export interface PatientApiDto {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatientRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
}

export interface CreatePatientWithAccountRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    email: string;
    password: string;
    imageUrl?: string;
}

export interface CreatePatientAccountRequest {
    email: string;
    password: string;
}

export interface UpdatePatientRequest {
    name?: string;
    cpf?: string;
    birthDate?: string;
}

export interface PatientFilterParams {
    companyId?: string;
    name?: string;
    cpf?: string;
}

export interface PatientsPage {
    patients: IPatient[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toPatient(dto: PatientApiDto): IPatient {
    return {
        id: dto.id,
        name: dto.name,
        cpf: dto.cpf,
        birthDate: parseLocalDate(dto.birthDate),
        companyId: dto.companyId,
        userId: dto.userId ?? undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}
