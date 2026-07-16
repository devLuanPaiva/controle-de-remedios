import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { DeliveryService } from '../services/delivery.service';
import * as DeliveryActions from './delivery.actions';

@Injectable()
export class DeliveryEffects {
    private readonly actions$ = inject(Actions);
    private readonly deliveryService = inject(DeliveryService);
    private readonly toast = inject(ToastService);

    loadDeliveries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DeliveryActions.loadDeliveries),
            switchMap((action) =>
                this.deliveryService.getDeliveries(action.companyId, action.page, action.filter).pipe(
                    map((page) =>
                        DeliveryActions.loadDeliveriesSuccess({
                            deliveries: page.deliveries,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(
                            DeliveryActions.loadDeliveriesFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar entregas.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadDeliveriesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.loadDeliveriesFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createDelivery$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DeliveryActions.createDelivery),
            exhaustMap((action) =>
                this.deliveryService.createDelivery(action.payload).pipe(
                    map((delivery) => DeliveryActions.createDeliverySuccess({ delivery })),
                    catchError((error) =>
                        of(
                            DeliveryActions.createDeliveryFailure({
                                message: extractErrorMessage(error, 'Erro ao registrar entrega.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    createDeliverySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.createDeliverySuccess),
                tap(() => this.toast.show(ToastType.Success, 'Entrega registrada com sucesso!')),
            ),
        { dispatch: false },
    );

    createDeliveryFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.createDeliveryFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    deliverPrescriptionTotal$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DeliveryActions.deliverPrescriptionTotal),
            exhaustMap((action) =>
                this.deliveryService.deliverPrescriptionTotal(action.prescriptionId).pipe(
                    map((deliveries) => DeliveryActions.deliverPrescriptionTotalSuccess({ deliveries })),
                    catchError((error) =>
                        of(
                            DeliveryActions.deliverPrescriptionTotalFailure({
                                message: extractErrorMessage(error, 'Erro ao entregar a receita.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    deliverPrescriptionTotalSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.deliverPrescriptionTotalSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Receita entregue com sucesso!')),
            ),
        { dispatch: false },
    );

    deliverPrescriptionTotalFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.deliverPrescriptionTotalFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadEligiblePrescriptions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DeliveryActions.loadEligiblePrescriptions),
            switchMap((action) =>
                this.deliveryService.getEligiblePrescriptions(action.companyId, action.cpf).pipe(
                    map((prescriptions) => DeliveryActions.loadEligiblePrescriptionsSuccess({ prescriptions })),
                    catchError((error) =>
                        of(
                            DeliveryActions.loadEligiblePrescriptionsFailure({
                                message: extractErrorMessage(error, 'Erro ao buscar receitas do paciente.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadEligiblePrescriptionsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(DeliveryActions.loadEligiblePrescriptionsFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
