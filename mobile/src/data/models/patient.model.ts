export interface IPatient {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    companyId: string;
    userId?: string;
    contact?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PatientFilterParams {
    name?: string;
    cpf?: string;
}

export interface CreatePatientRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    contact?: string;
    address?: string;
}

export interface UpdatePatientRequest {
    name?: string;
    cpf?: string;
    birthDate?: string;
    contact?: string;
    address?: string;
}
