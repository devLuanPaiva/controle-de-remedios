import { createFeatureSelector, createSelector } from '@ngrx/store';

import { MedicineMovementState } from './medicine-movement.state';

export const selectMedicineMovementState = createFeatureSelector<MedicineMovementState>('medicineMovements');

export const selectAllMedicineMovements = createSelector(selectMedicineMovementState, (state) => state.items);

export const selectMedicineMovementsLoading = createSelector(selectMedicineMovementState, (state) => state.loading);

export const selectMedicineMovementsError = createSelector(selectMedicineMovementState, (state) => state.error);

export const selectMedicineMovementsPagination = createSelector(selectMedicineMovementState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));

export const selectMedicineBalance = createSelector(selectMedicineMovementState, (state) => state.balance);

export const selectMedicineBalanceLoading = createSelector(selectMedicineMovementState, (state) => state.balanceLoading);
