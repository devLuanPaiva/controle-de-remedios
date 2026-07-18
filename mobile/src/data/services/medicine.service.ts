import { apiFetch } from "@/lib/apiFetch";
import { CreateMedicineRequest, IMedicine, UpdateMedicineRequest } from "@/data/models/medicine.model";

interface MedicineDto {
    id: string;
    name: string;
    eanCode: string | null;
    imageUrl: string | null;
    companyId: string;
}

function toMedicine(dto: MedicineDto): IMedicine {
    return {
        id: dto.id,
        name: dto.name,
        eanCode: dto.eanCode,
        imageUrl: dto.imageUrl,
        companyId: dto.companyId,
    };
}

export async function searchMedicineByEan(companyId: string, eanCode: string): Promise<IMedicine | null> {
    const response = await apiFetch<MedicineDto[]>(
        `/companies/${companyId}/medicines?eanCode=${encodeURIComponent(eanCode)}&page=0&size=1`,
    );

    const [medicine] = response.data;
    return medicine ? toMedicine(medicine) : null;
}

export async function createMedicine(payload: CreateMedicineRequest): Promise<IMedicine> {
    const response = await apiFetch<MedicineDto>("/medicines", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toMedicine(response.data);
}

export async function updateMedicine(id: string, payload: UpdateMedicineRequest): Promise<IMedicine> {
    const response = await apiFetch<MedicineDto>(`/medicines/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });

    return toMedicine(response.data);
}
