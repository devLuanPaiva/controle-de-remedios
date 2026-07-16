import { createAction, props } from '@ngrx/store';

import { MedicineMovementFilterParams } from '../models/medicine-movement-api.model';
import { IMedicineBalance, IMedicineMovement } from '../models/medicine-movement.model';

export const loadMedicineMovements = createAction(
    '[MedicineMovements] Load Medicine Movements',
    props<{ medicineId: string; page: number; filter?: MedicineMovementFilterParams }>(),
);

export const loadMedicineMovementsSuccess = createAction(
    '[MedicineMovements] Load Medicine Movements Success',
    props<{
        movements: IMedicineMovement[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadMedicineMovementsFailure = createAction(
    '[MedicineMovements] Load Medicine Movements Failure',
    props<{ message: string }>(),
);

export const loadMedicineBalance = createAction(
    '[MedicineMovements] Load Medicine Balance',
    props<{ medicineId: string }>(),
);

export const loadMedicineBalanceSuccess = createAction(
    '[MedicineMovements] Load Medicine Balance Success',
    props<{ balance: IMedicineBalance }>(),
);

export const loadMedicineBalanceFailure = createAction(
    '[MedicineMovements] Load Medicine Balance Failure',
    props<{ message: string }>(),
);
