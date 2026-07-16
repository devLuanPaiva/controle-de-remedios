import { createAction, props } from '@ngrx/store';

import { CreateMedicineRequest, MedicineFilterParams } from '../models/medicine-api.model';
import { IMedicine } from '../models/medicine.model';

export const loadMedicines = createAction(
    '[Medicines] Load Medicines',
    props<{ companyId: string; page: number; filter?: MedicineFilterParams }>(),
);

export const loadMedicinesSuccess = createAction(
    '[Medicines] Load Medicines Success',
    props<{
        medicines: IMedicine[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadMedicinesFailure = createAction(
    '[Medicines] Load Medicines Failure',
    props<{ message: string }>(),
);

export const createMedicine = createAction(
    '[Medicines] Create Medicine',
    props<{ payload: CreateMedicineRequest }>(),
);

export const createMedicineSuccess = createAction(
    '[Medicines] Create Medicine Success',
    props<{ medicine: IMedicine }>(),
);

export const createMedicineFailure = createAction(
    '[Medicines] Create Medicine Failure',
    props<{ message: string }>(),
);

export const loadMedicineById = createAction(
    '[Medicines] Load Medicine By Id',
    props<{ id: string }>(),
);

export const loadMedicineByIdSuccess = createAction(
    '[Medicines] Load Medicine By Id Success',
    props<{ medicine: IMedicine }>(),
);

export const loadMedicineByIdFailure = createAction(
    '[Medicines] Load Medicine By Id Failure',
    props<{ message: string }>(),
);

export const clearSelectedMedicine = createAction(
    '[Medicines] Clear Selected Medicine',
);
