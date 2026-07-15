import { createReducer, on } from '@ngrx/store';

import * as MedicineActions from './medicine.actions';
import { MedicineState } from './medicine.state';

const initialState: MedicineState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    selectedMedicine: null,
    selectedMedicineLoading: false,
};

export const medicineReducer = createReducer(
    initialState,

    on(MedicineActions.loadMedicines, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(MedicineActions.loadMedicinesSuccess, (state, { medicines, count, currentPage, totalPages, next, previous }) => ({
        ...state,
        items: medicines,
        count,
        currentPage,
        totalPages,
        next,
        previous,
        loading: false,
    })),

    on(MedicineActions.loadMedicinesFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(MedicineActions.createMedicine, (state) => ({
        ...state,
        mutating: true,
    })),

    on(MedicineActions.createMedicineSuccess, (state, { medicine }) => ({
        ...state,
        mutating: false,
        items: [medicine, ...state.items],
        count: state.count + 1,
    })),

    on(MedicineActions.createMedicineFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(MedicineActions.loadMedicineById, (state) => ({
        ...state,
        selectedMedicine: null,
        selectedMedicineLoading: true,
    })),

    on(MedicineActions.loadMedicineByIdSuccess, (state, { medicine }) => ({
        ...state,
        selectedMedicine: medicine,
        selectedMedicineLoading: false,
    })),

    on(MedicineActions.loadMedicineByIdFailure, (state, { message }) => ({
        ...state,
        selectedMedicineLoading: false,
        error: message,
    })),

    on(MedicineActions.clearSelectedMedicine, (state) => ({
        ...state,
        selectedMedicine: null,
    })),
);
