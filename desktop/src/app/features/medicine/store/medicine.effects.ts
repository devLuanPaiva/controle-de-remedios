import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { MedicineService } from '../services/medicine.service';
import * as MedicineActions from './medicine.actions';

@Injectable()
export class MedicineEffects {
    private readonly actions$ = inject(Actions);
    private readonly medicineService = inject(MedicineService);
    private readonly toast = inject(ToastService);

    loadMedicines$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MedicineActions.loadMedicines),
            switchMap((action) =>
                this.medicineService.getCompanyMedicines(action.companyId, action.page, action.filter).pipe(
                    map((page) =>
                        MedicineActions.loadMedicinesSuccess({
                            medicines: page.medicines,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(
                            MedicineActions.loadMedicinesFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar medicamentos.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadMedicinesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineActions.loadMedicinesFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createMedicine$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MedicineActions.createMedicine),
            exhaustMap((action) =>
                this.medicineService.createMedicine(action.payload).pipe(
                    map((medicine) => MedicineActions.createMedicineSuccess({ medicine })),
                    catchError((error) =>
                        of(
                            MedicineActions.createMedicineFailure({
                                message: extractErrorMessage(error, 'Erro ao criar medicamento.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    createMedicineSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineActions.createMedicineSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Medicamento cadastrado com sucesso!')),
            ),
        { dispatch: false },
    );

    createMedicineFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineActions.createMedicineFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadMedicineById$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MedicineActions.loadMedicineById),
            switchMap((action) =>
                this.medicineService.getMedicineById(action.id).pipe(
                    map((medicine) => MedicineActions.loadMedicineByIdSuccess({ medicine })),
                    catchError((error) =>
                        of(
                            MedicineActions.loadMedicineByIdFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar medicamento.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadMedicineByIdFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineActions.loadMedicineByIdFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
