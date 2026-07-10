import { IPatient } from '../models/patient.model';

export interface PatientState {
    items: IPatient[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    selectedPatient: IPatient | null;
    selectedPatientLoading: boolean;

    accountMutating: boolean;
}
