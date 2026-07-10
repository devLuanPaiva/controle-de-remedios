import { createReducer, on } from '@ngrx/store';

import * as PatientActions from './patient.actions';
import { PatientState } from './patient.state';

const initialState: PatientState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    selectedPatient: null,
    selectedPatientLoading: false,
    accountMutating: false,
};

export const patientReducer = createReducer(
    initialState,

    on(PatientActions.loadPatients, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(PatientActions.loadPatientsSuccess, (state, { patients, count, currentPage, totalPages, next, previous }) => ({
        ...state,
        items: patients,
        count,
        currentPage,
        totalPages,
        next,
        previous,
        loading: false,
    })),

    on(PatientActions.loadPatientsFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(PatientActions.loadPatient, (state) => ({
        ...state,
        selectedPatient: null,
        selectedPatientLoading: true,
    })),

    on(PatientActions.loadPatientSuccess, (state, { patient }) => ({
        ...state,
        selectedPatient: patient,
        selectedPatientLoading: false,
    })),

    on(PatientActions.loadPatientFailure, (state, { message }) => ({
        ...state,
        selectedPatientLoading: false,
        error: message,
    })),

    on(PatientActions.createPatient, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PatientActions.createPatientSuccess, (state, { patient }) => ({
        ...state,
        mutating: false,
        items: [patient, ...state.items],
        count: state.count + 1,
    })),

    on(PatientActions.createPatientFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PatientActions.createPatientWithAccount, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PatientActions.createPatientWithAccountSuccess, (state, { patient }) => ({
        ...state,
        mutating: false,
        items: [patient, ...state.items],
        count: state.count + 1,
    })),

    on(PatientActions.createPatientWithAccountFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PatientActions.updatePatient, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PatientActions.updatePatientSuccess, (state, { patient }) => ({
        ...state,
        mutating: false,
        items: state.items.map((item) => (item.id === patient.id ? patient : item)),
        selectedPatient: state.selectedPatient?.id === patient.id ? patient : state.selectedPatient,
    })),

    on(PatientActions.updatePatientFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PatientActions.deletePatient, (state) => ({
        ...state,
        mutating: true,
    })),

    on(PatientActions.deletePatientSuccess, (state, { id }) => ({
        ...state,
        mutating: false,
        items: state.items.filter((item) => item.id !== id),
        count: Math.max(0, state.count - 1),
        selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
    })),

    on(PatientActions.deletePatientFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(PatientActions.createPatientAccount, (state) => ({
        ...state,
        accountMutating: true,
    })),

    on(PatientActions.createPatientAccountSuccess, (state) => ({
        ...state,
        accountMutating: false,
    })),

    on(PatientActions.createPatientAccountFailure, (state, { message }) => ({
        ...state,
        accountMutating: false,
        error: message,
    })),

    on(PatientActions.removePatientAccount, (state) => ({
        ...state,
        accountMutating: true,
    })),

    on(PatientActions.removePatientAccountSuccess, (state) => ({
        ...state,
        accountMutating: false,
    })),

    on(PatientActions.removePatientAccountFailure, (state, { message }) => ({
        ...state,
        accountMutating: false,
        error: message,
    })),

    on(PatientActions.clearSelectedPatient, (state) => ({
        ...state,
        selectedPatient: null,
    })),
);
