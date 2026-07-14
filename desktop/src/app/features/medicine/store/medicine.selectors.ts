import { createFeatureSelector, createSelector } from '@ngrx/store';

import { MedicineState } from './medicine.state';

export const selectMedicineState = createFeatureSelector<MedicineState>('medicines');

export const selectAllMedicines = createSelector(selectMedicineState, (state) => state.items);

export const selectMedicinesLoading = createSelector(selectMedicineState, (state) => state.loading);

export const selectMedicinesError = createSelector(selectMedicineState, (state) => state.error);

export const selectMedicinesMutating = createSelector(selectMedicineState, (state) => state.mutating);

export const selectMedicinesPagination = createSelector(selectMedicineState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));
