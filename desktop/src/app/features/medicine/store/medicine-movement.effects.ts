import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { MedicineMovementService } from '../services/medicine-movement.service';
import * as MedicineMovementActions from './medicine-movement.actions';

@Injectable()
export class MedicineMovementEffects {
    private readonly actions$ = inject(Actions);
    private readonly medicineMovementService = inject(MedicineMovementService);
    private readonly toast = inject(ToastService);

    loadMedicineMovements$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MedicineMovementActions.loadMedicineMovements),
            switchMap((action) =>
                this.medicineMovementService.getMovements(action.medicineId, action.page, action.filter).pipe(
                    map((page) =>
                        MedicineMovementActions.loadMedicineMovementsSuccess({
                            movements: page.movements,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(
                            MedicineMovementActions.loadMedicineMovementsFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar movimentações.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadMedicineMovementsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineMovementActions.loadMedicineMovementsFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadMedicineBalance$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MedicineMovementActions.loadMedicineBalance),
            switchMap((action) =>
                this.medicineMovementService.getBalance(action.medicineId).pipe(
                    map((balance) => MedicineMovementActions.loadMedicineBalanceSuccess({ balance })),
                    catchError((error) =>
                        of(
                            MedicineMovementActions.loadMedicineBalanceFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar saldo do medicamento.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadMedicineBalanceFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(MedicineMovementActions.loadMedicineBalanceFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
