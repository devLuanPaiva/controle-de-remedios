import { createAction, props } from '@ngrx/store';

import { IUser } from '@features/users/models/user.model';

import {
    CreatePatientAccountRequest,
    CreatePatientRequest,
    CreatePatientWithAccountRequest,
    PatientFilterParams,
    UpdatePatientRequest,
} from '../models/patient-api.model';
import { IPatient } from '../models/patient.model';

export const loadPatients = createAction(
    '[Patients] Load Patients',
    props<{ page: number; filter?: PatientFilterParams }>(),
);

export const loadPatientsSuccess = createAction(
    '[Patients] Load Patients Success',
    props<{
        patients: IPatient[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadPatientsFailure = createAction(
    '[Patients] Load Patients Failure',
    props<{ message: string }>(),
);

export const loadPatient = createAction(
    '[Patients] Load Patient',
    props<{ id: string }>(),
);

export const loadPatientSuccess = createAction(
    '[Patients] Load Patient Success',
    props<{ patient: IPatient }>(),
);

export const loadPatientFailure = createAction(
    '[Patients] Load Patient Failure',
    props<{ message: string }>(),
);

export const createPatient = createAction(
    '[Patients] Create Patient',
    props<{ payload: CreatePatientRequest }>(),
);

export const createPatientSuccess = createAction(
    '[Patients] Create Patient Success',
    props<{ patient: IPatient }>(),
);

export const createPatientFailure = createAction(
    '[Patients] Create Patient Failure',
    props<{ message: string }>(),
);

export const createPatientWithAccount = createAction(
    '[Patients] Create Patient With Account',
    props<{ payload: CreatePatientWithAccountRequest }>(),
);

export const createPatientWithAccountSuccess = createAction(
    '[Patients] Create Patient With Account Success',
    props<{ patient: IPatient }>(),
);

export const createPatientWithAccountFailure = createAction(
    '[Patients] Create Patient With Account Failure',
    props<{ message: string }>(),
);

export const updatePatient = createAction(
    '[Patients] Update Patient',
    props<{ id: string; payload: UpdatePatientRequest }>(),
);

export const updatePatientSuccess = createAction(
    '[Patients] Update Patient Success',
    props<{ patient: IPatient }>(),
);

export const updatePatientFailure = createAction(
    '[Patients] Update Patient Failure',
    props<{ message: string }>(),
);

export const deletePatient = createAction(
    '[Patients] Delete Patient',
    props<{ id: string }>(),
);

export const deletePatientSuccess = createAction(
    '[Patients] Delete Patient Success',
    props<{ id: string }>(),
);

export const deletePatientFailure = createAction(
    '[Patients] Delete Patient Failure',
    props<{ message: string }>(),
);

export const createPatientAccount = createAction(
    '[Patients] Create Patient Account',
    props<{ patientId: string; payload: CreatePatientAccountRequest }>(),
);

export const createPatientAccountSuccess = createAction(
    '[Patients] Create Patient Account Success',
    props<{ patientId: string; user: IUser }>(),
);

export const createPatientAccountFailure = createAction(
    '[Patients] Create Patient Account Failure',
    props<{ message: string }>(),
);

export const removePatientAccount = createAction(
    '[Patients] Remove Patient Account',
    props<{ patientId: string }>(),
);

export const removePatientAccountSuccess = createAction(
    '[Patients] Remove Patient Account Success',
    props<{ patientId: string }>(),
);

export const removePatientAccountFailure = createAction(
    '[Patients] Remove Patient Account Failure',
    props<{ message: string }>(),
);

export const clearSelectedPatient = createAction(
    '[Patients] Clear Selected Patient',
);
