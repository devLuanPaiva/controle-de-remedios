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
