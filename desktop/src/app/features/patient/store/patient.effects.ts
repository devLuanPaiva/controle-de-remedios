import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { PatientService } from '../services/patient.service';
import * as PatientActions from './patient.actions';

@Injectable()
export class PatientEffects {
    private readonly actions$ = inject(Actions);
    private readonly patientService = inject(PatientService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    loadPatients$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.loadPatients),
            switchMap((action) =>
                this.patientService.getPatients(action.page, action.filter).pipe(
                    map((page) =>
                        PatientActions.loadPatientsSuccess({
                            patients: page.patients,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(PatientActions.loadPatientsFailure({ message: extractErrorMessage(error, 'Erro ao carregar pacientes.') })),
                    ),
                ),
            ),
        ),
    );

    loadPatientsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.loadPatientsFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadPatient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.loadPatient),
            switchMap((action) =>
                this.patientService.getPatientById(action.id).pipe(
                    map((patient) => PatientActions.loadPatientSuccess({ patient })),
                    catchError((error) =>
                        of(PatientActions.loadPatientFailure({ message: extractErrorMessage(error, 'Erro ao carregar paciente.') })),
                    ),
                ),
            ),
        ),
    );

    loadPatientFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.loadPatientFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createPatient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.createPatient),
            exhaustMap((action) =>
                this.patientService.createPatient(action.payload).pipe(
                    map((patient) => PatientActions.createPatientSuccess({ patient })),
                    catchError((error) =>
                        of(PatientActions.createPatientFailure({ message: extractErrorMessage(error, 'Erro ao criar paciente.') })),
                    ),
                ),
            ),
        ),
    );

    createPatientSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.createPatientSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Paciente criado com sucesso!')),
            ),
        { dispatch: false },
    );

    createPatientFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.createPatientFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createPatientWithAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.createPatientWithAccount),
            exhaustMap((action) =>
                this.patientService.createPatientWithAccount(action.payload).pipe(
                    map((patient) => PatientActions.createPatientWithAccountSuccess({ patient })),
                    catchError((error) =>
                        of(
                            PatientActions.createPatientWithAccountFailure({
                                message: extractErrorMessage(error, 'Erro ao criar paciente com conta.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    createPatientWithAccountSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.createPatientWithAccountSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Paciente e conta criados com sucesso!')),
            ),
        { dispatch: false },
    );

    createPatientWithAccountFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.createPatientWithAccountFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    updatePatient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.updatePatient),
            exhaustMap((action) =>
                this.patientService.updatePatient(action.id, action.payload).pipe(
                    map((patient) => PatientActions.updatePatientSuccess({ patient })),
                    catchError((error) =>
                        of(PatientActions.updatePatientFailure({ message: extractErrorMessage(error, 'Erro ao atualizar paciente.') })),
                    ),
                ),
            ),
        ),
    );

    updatePatientSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.updatePatientSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Paciente atualizado com sucesso!')),
            ),
        { dispatch: false },
    );

    updatePatientFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.updatePatientFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    deletePatient$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.deletePatient),
            exhaustMap((action) =>
                this.patientService.deletePatient(action.id).pipe(
                    map(() => PatientActions.deletePatientSuccess({ id: action.id })),
                    catchError((error) =>
                        of(PatientActions.deletePatientFailure({ message: extractErrorMessage(error, 'Erro ao excluir paciente.') })),
                    ),
                ),
            ),
        ),
    );

    deletePatientSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.deletePatientSuccess),
                tap(() => {
                    this.toast.show(ToastType.Success, 'Paciente excluído com sucesso!');
                    this.router.navigate(['/patients']);
                }),
            ),
        { dispatch: false },
    );

    deletePatientFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.deletePatientFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createPatientAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.createPatientAccount),
            exhaustMap((action) =>
                this.patientService.createPatientAccount(action.patientId, action.payload).pipe(
                    map((user) => PatientActions.createPatientAccountSuccess({ patientId: action.patientId, user })),
                    catchError((error) =>
                        of(
                            PatientActions.createPatientAccountFailure({
                                message: extractErrorMessage(error, 'Erro ao criar conta do paciente.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    createPatientAccountSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.createPatientAccountSuccess),
            tap(() => this.toast.show(ToastType.Success, 'Conta vinculada ao paciente com sucesso!')),
            map((action) => PatientActions.loadPatient({ id: action.patientId })),
        ),
    );

    createPatientAccountFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.createPatientAccountFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    removePatientAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.removePatientAccount),
            exhaustMap((action) =>
                this.patientService.removePatientAccount(action.patientId).pipe(
                    map(() => PatientActions.removePatientAccountSuccess({ patientId: action.patientId })),
                    catchError((error) =>
                        of(
                            PatientActions.removePatientAccountFailure({
                                message: extractErrorMessage(error, 'Erro ao desassociar conta do paciente.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    removePatientAccountSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PatientActions.removePatientAccountSuccess),
            tap(() => this.toast.show(ToastType.Success, 'Conta desassociada do paciente com sucesso!')),
            map((action) => PatientActions.loadPatient({ id: action.patientId })),
        ),
    );

    removePatientAccountFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PatientActions.removePatientAccountFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
