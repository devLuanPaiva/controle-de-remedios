import { IDelivery, IEligiblePrescription } from '../models/delivery.model';

export interface DeliveryState {
    items: IDelivery[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    eligiblePrescriptions: IEligiblePrescription[];
    eligiblePrescriptionsLoading: boolean;
}
