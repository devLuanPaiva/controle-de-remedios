import { apiFetch } from "@/lib/apiFetch";
import { fetchAllPages } from "@/lib/fetchAllPages";
import { ICompany } from "@/data/models/company.model";

const COMPANIES_PAGE_SIZE = 100;

interface CompanyDto {
    id: string;
    name: string;
    slug: string;
    cnpj: string;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

function toCompany(dto: CompanyDto): ICompany {
    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        cnpj: dto.cnpj,
        imageUrl: dto.imageUrl ?? undefined,
        active: dto.active,
    };
}

export async function getCompanies(): Promise<ICompany[]> {
    return fetchAllPages(
        (page) => apiFetch<CompanyDto[]>(`/companies?page=${page}&size=${COMPANIES_PAGE_SIZE}`),
        toCompany,
    );
}
