import { IPrescriptionDetail, IPrescriptionListItem } from '../models/prescription.model';

export interface PrescriptionState {
    items: IPrescriptionListItem[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    selectedPrescription: IPrescriptionDetail | null;
    selectedPrescriptionLoading: boolean;

    mutatingItemIds: string[];
}
