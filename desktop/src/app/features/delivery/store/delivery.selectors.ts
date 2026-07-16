import { createFeatureSelector, createSelector } from '@ngrx/store';

import { DeliveryState } from './delivery.state';

export const selectDeliveryState = createFeatureSelector<DeliveryState>('deliveries');

export const selectAllDeliveries = createSelector(selectDeliveryState, (state) => state.items);

export const selectDeliveriesLoading = createSelector(selectDeliveryState, (state) => state.loading);

export const selectDeliveriesError = createSelector(selectDeliveryState, (state) => state.error);

export const selectDeliveriesMutating = createSelector(selectDeliveryState, (state) => state.mutating);

export const selectDeliveriesPagination = createSelector(selectDeliveryState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));

export const selectEligiblePrescriptions = createSelector(selectDeliveryState, (state) => state.eligiblePrescriptions);

export const selectEligiblePrescriptionsLoading = createSelector(
    selectDeliveryState,
    (state) => state.eligiblePrescriptionsLoading,
);
