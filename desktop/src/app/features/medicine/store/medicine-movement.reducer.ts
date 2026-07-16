import { createReducer, on } from '@ngrx/store';

import * as MedicineMovementActions from './medicine-movement.actions';
import { MedicineMovementState } from './medicine-movement.state';

const initialState: MedicineMovementState = {
    items: [],
    loading: false,
    error: null,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    balance: null,
    balanceLoading: false,
};

export const medicineMovementReducer = createReducer(
    initialState,

    on(MedicineMovementActions.loadMedicineMovements, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(
        MedicineMovementActions.loadMedicineMovementsSuccess,
        (state, { movements, count, currentPage, totalPages, next, previous }) => ({
            ...state,
            items: movements,
            count,
            currentPage,
            totalPages,
            next,
            previous,
            loading: false,
        }),
    ),

    on(MedicineMovementActions.loadMedicineMovementsFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(MedicineMovementActions.loadMedicineBalance, (state) => ({
        ...state,
        balanceLoading: true,
    })),

    on(MedicineMovementActions.loadMedicineBalanceSuccess, (state, { balance }) => ({
        ...state,
        balance,
        balanceLoading: false,
    })),

    on(MedicineMovementActions.loadMedicineBalanceFailure, (state, { message }) => ({
        ...state,
        balanceLoading: false,
        error: message,
    })),
);
