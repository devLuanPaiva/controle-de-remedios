import { createReducer, on } from '@ngrx/store';

import * as PrescriptionActions from './prescription.actions';
import { PrescriptionState } from './prescription.state';

const initialState: PrescriptionState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    selectedPrescription: null,
    selectedPrescriptionLoading: false,
};

export const prescriptionReducer = createReducer(
    initialState,

    on(PrescriptionActions.loadPrescriptions, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(
        PrescriptionActions.loadPrescriptionsSuccess,
        (state, { prescriptions, count, currentPage, totalPages, next, previous }) => ({
            ...state,
            items: prescriptions,
            count,
            currentPage,
            totalPages,
            next,
            previous,
            loading: false,
        }),
    ),

    on(PrescriptionActions.loadPrescriptionsFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(PrescriptionActions.loadPrescription, (state) => ({
        ...state,
        selectedPrescription: null,
        selectedPrescriptionLoading: true,
    })),

    on(PrescriptionActions.loadPrescriptionSuccess, (state, { prescription }) => ({
        ...state,
        selectedPrescription: prescription,
        selectedPrescriptionLoading: false,
    })),

    on(PrescriptionActions.loadPrescriptionFailure, (state, { message }) => ({
        ...state,
        selectedPrescriptionLoading: false,
        error: message,
    })),

    on(PrescriptionActions.createPrescription, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PrescriptionActions.createPrescriptionSuccess, (state) => ({
        ...state,
        mutating: false,
    })),

    on(PrescriptionActions.createPrescriptionFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PrescriptionActions.updatePrescription, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PrescriptionActions.updatePrescriptionSuccess, (state, { prescription }) => ({
        ...state,
        mutating: false,
        items: state.items.map((item) =>
            item.id === prescription.id
                ? {
                      ...item,
                      status: prescription.status,
                      imageUrl: prescription.imageUrl,
                      issueDate: prescription.issueDate,
                      updatedAt: prescription.updatedAt,
                  }
                : item,
        ),
        selectedPrescription:
            state.selectedPrescription?.id === prescription.id
                ? {
                      ...state.selectedPrescription,
                      status: prescription.status,
                      imageUrl: prescription.imageUrl,
                      issueDate: prescription.issueDate,
                      updatedAt: prescription.updatedAt,
                  }
                : state.selectedPrescription,
    })),

    on(PrescriptionActions.updatePrescriptionFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PrescriptionActions.deletePrescription, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PrescriptionActions.deletePrescriptionSuccess, (state, { id }) => ({
        ...state,
        mutating: false,
        items: state.items.filter((item) => item.id !== id),
        count: Math.max(0, state.count - 1),
        selectedPrescription: state.selectedPrescription?.id === id ? null : state.selectedPrescription,
    })),

    on(PrescriptionActions.deletePrescriptionFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PrescriptionActions.clearSelectedPrescription, (state) => ({
        ...state,
        selectedPrescription: null,
    })),
);
