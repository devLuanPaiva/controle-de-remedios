import { PrescriptionStatus } from '@features/prescription/models/prescription.model';


export const PRESCRIPTION_STATUS_CHART_ORDER: PrescriptionStatus[] = [
    PrescriptionStatus.PENDING,
    PrescriptionStatus.APPROVED,
    PrescriptionStatus.DELIVERED,
    PrescriptionStatus.PARTIAL_DELIVERED,
    PrescriptionStatus.REJECTED,
];

export const PRESCRIPTION_STATUS_COLORS: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: '#2a78d6',
    [PrescriptionStatus.APPROVED]: '#e87ba4',
    [PrescriptionStatus.DELIVERED]: '#008300',
    [PrescriptionStatus.PARTIAL_DELIVERED]: '#4a3aa7',
    [PrescriptionStatus.REJECTED]: '#e34948',
};

export const FULFILLMENT_DELIVERED_COLOR = PRESCRIPTION_STATUS_COLORS[PrescriptionStatus.DELIVERED];
export const FULFILLMENT_PARTIAL_COLOR = PRESCRIPTION_STATUS_COLORS[PrescriptionStatus.PARTIAL_DELIVERED];

export const TIMELINE_SERIES_COLOR = '#2a78d6';
export const TIMELINE_SERIES_FILL = '#2a78d61a';
