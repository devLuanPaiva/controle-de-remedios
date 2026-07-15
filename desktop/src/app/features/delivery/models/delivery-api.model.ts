import { UnityType } from '@features/prescription/models/prescription-item.model';
import { PrescriptionStatus } from '@features/prescription/models/prescription.model';

import { IDelivery, IEligiblePrescription, IEligiblePrescriptionItem } from './delivery.model';

export interface DeliveryApiDto {
    id: string;
    companyId: string;
    patientId: string;
    patientName: string;
    prescriptionItemId: string;
    medicineName: string;
    unityType: UnityType;
    deliveryDate: string;
    nextAvailableDate: string;
    deliveryQuantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeliveryRequest {
    prescriptionItemId: string;
    deliveryDate: string;
    deliveryQuantity: number;
}

export interface DeliveryFilterParams {
    patientId?: string;
    medicineId?: string;
    medicineName?: string;
    patientName?: string;
    patientEmail?: string;
    patientCpf?: string;
}

export interface DeliveriesPage {
    deliveries: IDelivery[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export interface EligiblePrescriptionItemApiDto {
    id: string;
    status: PrescriptionStatus;
    dosage: string;
    unityType: UnityType;
    receivedQuantity: number;
    deliveredQuantity: number;
    medicineName: string;
    medicineEanCode: string | null;
}

export interface EligiblePrescriptionApiDto {
    id: string;
    coverImageUrl: string | null;
    issueDate: string;
    items: EligiblePrescriptionItemApiDto[];
}

export function toDelivery(dto: DeliveryApiDto): IDelivery {
    return {
        id: dto.id,
        companyId: dto.companyId,
        patientId: dto.patientId,
        patientName: dto.patientName,
        prescriptionItemId: dto.prescriptionItemId,
        medicineName: dto.medicineName,
        unityType: dto.unityType,
        deliveryDate: new Date(dto.deliveryDate),
        nextAvailableDate: new Date(dto.nextAvailableDate),
        deliveryQuantity: dto.deliveryQuantity,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export function toEligiblePrescriptionItem(dto: EligiblePrescriptionItemApiDto): IEligiblePrescriptionItem {
    return { ...dto };
}

export function toEligiblePrescription(dto: EligiblePrescriptionApiDto): IEligiblePrescription {
    return {
        id: dto.id,
        coverImageUrl: dto.coverImageUrl,
        issueDate: new Date(dto.issueDate),
        items: dto.items.map(toEligiblePrescriptionItem),
    };
}
