import { createReducer, on } from '@ngrx/store';

import * as DeliveryActions from './delivery.actions';
import { DeliveryState } from './delivery.state';

const initialState: DeliveryState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    eligiblePrescriptions: [],
    eligiblePrescriptionsLoading: false,
};

export const deliveryReducer = createReducer(
    initialState,

    on(DeliveryActions.loadDeliveries, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(
        DeliveryActions.loadDeliveriesSuccess,
        (state, { deliveries, count, currentPage, totalPages, next, previous }) => ({
            ...state,
            items: deliveries,
            count,
            currentPage,
            totalPages,
            next,
            previous,
            loading: false,
        }),
    ),

    on(DeliveryActions.loadDeliveriesFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(DeliveryActions.createDelivery, (state) => ({
        ...state,
        mutating: true,
    })),

    on(DeliveryActions.createDeliverySuccess, (state) => ({
        ...state,
        mutating: false,
    })),

    on(DeliveryActions.createDeliveryFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(DeliveryActions.deliverPrescriptionTotal, (state) => ({
        ...state,
        mutating: true,
    })),

    on(DeliveryActions.deliverPrescriptionTotalSuccess, (state) => ({
        ...state,
        mutating: false,
    })),

    on(DeliveryActions.deliverPrescriptionTotalFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(DeliveryActions.loadEligiblePrescriptions, (state) => ({
        ...state,
        eligiblePrescriptions: [],
        eligiblePrescriptionsLoading: true,
    })),

    on(DeliveryActions.loadEligiblePrescriptionsSuccess, (state, { prescriptions }) => ({
        ...state,
        eligiblePrescriptions: prescriptions,
        eligiblePrescriptionsLoading: false,
    })),

    on(DeliveryActions.loadEligiblePrescriptionsFailure, (state, { message }) => ({
        ...state,
        eligiblePrescriptionsLoading: false,
        error: message,
    })),

    on(DeliveryActions.clearEligiblePrescriptions, (state) => ({
        ...state,
        eligiblePrescriptions: [],
    })),
);
