export interface CompanyApiDto {
    id: string;
    name: string;
    slug: string;
    cnpj: string;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompanyRequest {
    name: string;
    cnpj: string;
    imageUrl?: string;
}

export interface UpdateCompanyRequest {
    name?: string;
    imageUrl?: string;
    active?: boolean;
}
