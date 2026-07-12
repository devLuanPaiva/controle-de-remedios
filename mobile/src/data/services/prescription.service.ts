import { apiFetch } from "@/lib/apiFetch";
import { CreatePrescriptionRequest, IPrescription, PrescriptionStatus } from "@/data/models/prescription.model";

interface PrescriptionDto {
    id: string;
    status: PrescriptionStatus;
    imageUrls: string[];
    issueDate: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
}

function toPrescription(dto: PrescriptionDto): IPrescription {
    return {
        id: dto.id,
        status: dto.status,
        imageUrls: dto.imageUrls,
        issueDate: new Date(dto.issueDate),
        patientId: dto.patientId,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export async function createPrescription(payload: CreatePrescriptionRequest): Promise<IPrescription> {
    const response = await apiFetch<PrescriptionDto>("/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toPrescription(response.data);
}
