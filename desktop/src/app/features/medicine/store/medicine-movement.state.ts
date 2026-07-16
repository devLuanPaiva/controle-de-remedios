import { IMedicineBalance, IMedicineMovement } from '../models/medicine-movement.model';

export interface MedicineMovementState {
    items: IMedicineMovement[];

    loading: boolean;
    error: string | null;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    balance: IMedicineBalance | null;
    balanceLoading: boolean;
}
