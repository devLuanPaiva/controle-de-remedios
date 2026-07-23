import { PrescriptionStatus } from '@features/prescription/models/prescription.model';
import { UnityType } from '@features/prescription/models/prescription-item.model';

export enum DeliveryTimelineGranularity {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
}

export interface IPrescriptionStatusCount {
    status: PrescriptionStatus;
    count: number;
}

export interface IPrescriptionStatusBreakdown {
    totalPrescriptions: number;
    items: IPrescriptionStatusCount[];
}

export interface IQueueItem {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    medicineName: string;
    unityType: UnityType;
    prescribedQuantity: number;
    requestedAt: Date;
    waitingDays: number;
}

export interface IDeliveryQueueSummary {
    pendingCount: number;
    averageWaitDays: number | null;
    oldestPending: IQueueItem[];
}

export interface IAvailabilityItem {
    deliveryId: string;
    patientId: string;
    patientName: string;
    medicineName: string;
    unityType: UnityType;
    nextAvailableDate: Date;
    daysUntilAvailable: number;
}

export interface IAvailabilityList {
    count: number;
    items: IAvailabilityItem[];
}

export interface IFulfillmentSummary {
    deliveredCount: number;
    partialCount: number;
    totalCount: number;
    completionRate: number | null;
    prescribedQuantityTotal: number;
    deliveredQuantityTotal: number;
    coverageRate: number | null;
}

export interface IDeliveryTimelinePoint {
    periodStart: Date;
    deliveriesCount: number;
    quantityTotal: number;
}

export interface IDeliveryTimeline {
    granularity: DeliveryTimelineGranularity;
    points: IDeliveryTimelinePoint[];
}
