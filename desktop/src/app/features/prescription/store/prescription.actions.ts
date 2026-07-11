import { createAction, props } from '@ngrx/store';

import {
    CreatePrescriptionRequest,
    PrescriptionFilterParams,
    UpdatePrescriptionRequest,
} from '../models/prescription-api.model';
import { IPrescription, IPrescriptionDetail, IPrescriptionListItem } from '../models/prescription.model';

export const loadPrescriptions = createAction(
    '[Prescriptions] Load Prescriptions',
    props<{ page: number; filter?: PrescriptionFilterParams }>(),
);

export const loadPrescriptionsSuccess = createAction(
    '[Prescriptions] Load Prescriptions Success',
    props<{
        prescriptions: IPrescriptionListItem[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadPrescriptionsFailure = createAction(
    '[Prescriptions] Load Prescriptions Failure',
    props<{ message: string }>(),
);

export const loadPrescription = createAction(
    '[Prescriptions] Load Prescription',
    props<{ id: string }>(),
);

export const loadPrescriptionSuccess = createAction(
    '[Prescriptions] Load Prescription Success',
    props<{ prescription: IPrescriptionDetail }>(),
);

export const loadPrescriptionFailure = createAction(
    '[Prescriptions] Load Prescription Failure',
    props<{ message: string }>(),
);

export const createPrescription = createAction(
    '[Prescriptions] Create Prescription',
    props<{ payload: CreatePrescriptionRequest }>(),
);

export const createPrescriptionSuccess = createAction(
    '[Prescriptions] Create Prescription Success',
    props<{ prescription: IPrescription }>(),
);

export const createPrescriptionFailure = createAction(
    '[Prescriptions] Create Prescription Failure',
    props<{ message: string }>(),
);

export const updatePrescription = createAction(
    '[Prescriptions] Update Prescription',
    props<{ id: string; payload: UpdatePrescriptionRequest }>(),
);

export const updatePrescriptionSuccess = createAction(
    '[Prescriptions] Update Prescription Success',
    props<{ prescription: IPrescription }>(),
);

export const updatePrescriptionFailure = createAction(
    '[Prescriptions] Update Prescription Failure',
    props<{ message: string }>(),
);

export const deletePrescription = createAction(
    '[Prescriptions] Delete Prescription',
    props<{ id: string }>(),
);

export const deletePrescriptionSuccess = createAction(
    '[Prescriptions] Delete Prescription Success',
    props<{ id: string }>(),
);

export const deletePrescriptionFailure = createAction(
    '[Prescriptions] Delete Prescription Failure',
    props<{ message: string }>(),
);

export const clearSelectedPrescription = createAction(
    '[Prescriptions] Clear Selected Prescription',
);
