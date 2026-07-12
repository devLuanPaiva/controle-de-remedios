import { apiFetch } from "@/lib/apiFetch";
import { onlyDigits } from "@/lib/cpf";
import { IPatient } from "@/data/models/patient.model";

const PATIENT_SEARCH_PAGE_SIZE = 20;

interface PatientDto {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

function toPatient(dto: PatientDto): IPatient {
    return {
        id: dto.id,
        name: dto.name,
        cpf: dto.cpf,
        birthDate: new Date(dto.birthDate),
        companyId: dto.companyId,
        userId: dto.userId ?? undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export async function searchPatients(term: string, companyId?: string): Promise<IPatient[]> {
    const trimmed = term.trim();

    if (!trimmed) {
        return [];
    }

    const isNumeric = /^\d+$/.test(onlyDigits(trimmed));

    const params = new URLSearchParams({
        page: "0",
        size: String(PATIENT_SEARCH_PAGE_SIZE),
    });

    if (companyId) {
        params.set("companyId", companyId);
    }

    if (isNumeric) {
        params.set("cpf", onlyDigits(trimmed));
    } else {
        params.set("name", trimmed);
    }

    const response = await apiFetch<PatientDto[]>(`/patients?${params.toString()}`);
    return response.data.map(toPatient);
}
