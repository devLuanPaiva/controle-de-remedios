import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { PrescriptionService } from '../services/prescription.service';
import * as PrescriptionActions from './prescription.actions';

@Injectable()
export class PrescriptionEffects {
    private readonly actions$ = inject(Actions);
    private readonly prescriptionService = inject(PrescriptionService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    loadPrescriptions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PrescriptionActions.loadPrescriptions),
            switchMap((action) =>
                this.prescriptionService.getPrescriptions(action.page, action.filter).pipe(
                    map((page) =>
                        PrescriptionActions.loadPrescriptionsSuccess({
                            prescriptions: page.prescriptions,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(
                            PrescriptionActions.loadPrescriptionsFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar receituários.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadPrescriptionsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.loadPrescriptionsFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadPrescription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PrescriptionActions.loadPrescription),
            switchMap((action) =>
                this.prescriptionService.getPrescriptionById(action.id).pipe(
                    map((prescription) => PrescriptionActions.loadPrescriptionSuccess({ prescription })),
                    catchError((error) =>
                        of(
                            PrescriptionActions.loadPrescriptionFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar receituário.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadPrescriptionFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.loadPrescriptionFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createPrescription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PrescriptionActions.createPrescription),
            exhaustMap((action) =>
                this.prescriptionService.createPrescription(action.payload).pipe(
                    map((prescription) => PrescriptionActions.createPrescriptionSuccess({ prescription })),
                    catchError((error) =>
                        of(
                            PrescriptionActions.createPrescriptionFailure({
                                message: extractErrorMessage(error, 'Erro ao criar receituário.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    createPrescriptionSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.createPrescriptionSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Receituário criado com sucesso!')),
            ),
        { dispatch: false },
    );

    createPrescriptionFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.createPrescriptionFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    updatePrescription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PrescriptionActions.updatePrescription),
            exhaustMap((action) =>
                this.prescriptionService.updatePrescription(action.id, action.payload).pipe(
                    map((prescription) => PrescriptionActions.updatePrescriptionSuccess({ prescription })),
                    catchError((error) =>
                        of(
                            PrescriptionActions.updatePrescriptionFailure({
                                message: extractErrorMessage(error, 'Erro ao atualizar receituário.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    updatePrescriptionSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.updatePrescriptionSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Receituário atualizado com sucesso!')),
            ),
        { dispatch: false },
    );

    updatePrescriptionFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.updatePrescriptionFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    deletePrescription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PrescriptionActions.deletePrescription),
            exhaustMap((action) =>
                this.prescriptionService.deletePrescription(action.id).pipe(
                    map(() => PrescriptionActions.deletePrescriptionSuccess({ id: action.id })),
                    catchError((error) =>
                        of(
                            PrescriptionActions.deletePrescriptionFailure({
                                message: extractErrorMessage(error, 'Erro ao excluir receituário.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    deletePrescriptionSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.deletePrescriptionSuccess),
                tap(() => {
                    this.toast.show(ToastType.Success, 'Receituário excluído com sucesso!');
                    this.router.navigate(['/prescriptions']);
                }),
            ),
        { dispatch: false },
    );

    deletePrescriptionFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PrescriptionActions.deletePrescriptionFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
