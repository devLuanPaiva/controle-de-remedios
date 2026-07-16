import { IMedicine } from '../models/medicine.model';

export interface MedicineState {
    items: IMedicine[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    selectedMedicine: IMedicine | null;
    selectedMedicineLoading: boolean;
}
