import { UnityType } from '@features/prescription/models/prescription-item.model';
import { PrescriptionStatus } from '@features/prescription/models/prescription.model';

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

export interface IEligiblePrescriptionItem {
    id: string;
    status: PrescriptionStatus;
    dosage: string;
    unityType: UnityType;
    receivedQuantity: number;
    deliveredQuantity: number;
    medicineName: string;
    medicineEanCode: string | null;
}

export interface IEligiblePrescription {
    id: string;
    coverImageUrl: string | null;
    issueDate: Date;
    items: IEligiblePrescriptionItem[];
}

export function isDeliverableStatus(status: PrescriptionStatus): boolean {
    return status === PrescriptionStatus.PENDING || status === PrescriptionStatus.APPROVED;
}
