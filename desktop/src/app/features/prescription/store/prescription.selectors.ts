import { createFeatureSelector, createSelector } from '@ngrx/store';

import { PrescriptionState } from './prescription.state';

export const selectPrescriptionState = createFeatureSelector<PrescriptionState>('prescriptions');

export const selectAllPrescriptions = createSelector(selectPrescriptionState, (state) => state.items);

export const selectPrescriptionsLoading = createSelector(selectPrescriptionState, (state) => state.loading);

export const selectPrescriptionsError = createSelector(selectPrescriptionState, (state) => state.error);

export const selectPrescriptionsMutating = createSelector(selectPrescriptionState, (state) => state.mutating);

export const selectPrescriptionsPagination = createSelector(selectPrescriptionState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));

export const selectSelectedPrescription = createSelector(selectPrescriptionState, (state) => state.selectedPrescription);

export const selectSelectedPrescriptionLoading = createSelector(
    selectPrescriptionState,
    (state) => state.selectedPrescriptionLoading,
);
