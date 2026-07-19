export interface IMedicine {
    id: string;
    name: string;
    eanCode: string | null;
    imageUrl: string | null;
    companyId: string;
}

export interface CreateMedicineRequest {
    name: string;
    eanCode: string;
    imageUrl?: string;
    companyId: string;
}

export interface UpdateMedicineRequest {
    name?: string;
    imageUrl?: string;
}
