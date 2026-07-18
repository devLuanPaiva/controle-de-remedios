import { UnityType } from "@/data/models/prescription-item.model";

export interface IDelivery {
    id: string;
    companyId: string;
    patientId: string;
    patientName: string;
    prescriptionItemId: string;
    medicineName: string;
    unityType: UnityType;
    deliveryDate: Date;
    nextAvailableDate: Date;
    deliveryQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPendingDeliveryItem {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    issueDate: Date;
    medicineName: string;
    unityType: UnityType;
    prescribedQuantity: number;
}

export interface DeliveryFilterParams {
    patientName?: string;
    patientCpf?: string;
}

export interface CreateDeliveryRequest {
    prescriptionItemId: string;
    deliveryDate: string;
    deliveryQuantity: number;
}
