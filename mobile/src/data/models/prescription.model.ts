import { CreatePrescriptionItemRequest } from "@/data/models/prescription-item.model";

export enum PrescriptionStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    DELIVERED = "DELIVERED",
    PARTIAL_DELIVERED = "PARTIAL_DELIVERED",
}

export const PrescriptionStatusLabels: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: "Pendente",
    [PrescriptionStatus.APPROVED]: "Aprovada",
    [PrescriptionStatus.REJECTED]: "Rejeitada",
    [PrescriptionStatus.DELIVERED]: "Entregue",
    [PrescriptionStatus.PARTIAL_DELIVERED]: "Entrega parcial",
};

export interface IPrescription {
    id: string;
    status: PrescriptionStatus;
    imageUrls: string[];
    issueDate: Date;
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePrescriptionRequest {
    imageUrls?: string[];
    issueDate: string;
    patientId: string;
    items: CreatePrescriptionItemRequest[];
}
