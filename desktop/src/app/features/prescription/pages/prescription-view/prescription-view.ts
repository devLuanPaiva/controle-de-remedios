import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { isDeliverableStatus } from '@features/delivery/models/delivery.model';
import * as DeliveryActions from '@features/delivery/store/delivery.actions';
import { selectDeliveriesMutating } from '@features/delivery/store/delivery.selectors';
import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';
import { DeliverQuantityModal } from '@shared/ui/deliver-quantity-modal/deliver-quantity-modal';
import { ImageFallback } from '@shared/ui/image-fallback/image-fallback';
import { PrescriptionStatusBadge } from '@shared/ui/prescription-status-badge/prescription-status-badge';
import { ViewMode, ViewToggle } from '@shared/ui/view-toggle/view-toggle';
import { formatCpf } from '@shared/utils/cpf.util';
import { toDateInputValue } from '@shared/utils/date.util';

import {
    FrequencyTypeLabels,
    IPrescriptionItem,
    TreatmentTypeLabels,
    UnityTypeLabels,
} from '../../models/prescription-item.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectPrescriptionsError,
    selectSelectedPrescription,
    selectSelectedPrescriptionLoading,
} from '../../store/prescription.selectors';

@Component({
    selector: 'app-prescription-view',
    imports: [DatePipe, ConfirmDialog, PrescriptionStatusBadge, ViewToggle, ImageFallback, DeliverQuantityModal],
    templateUrl: './prescription-view.html',
    styleUrl: './prescription-view.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionView implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly actions$ = inject(Actions);

    readonly formatCpf = formatCpf;
    readonly UnityTypeLabels = UnityTypeLabels;
    readonly FrequencyTypeLabels = FrequencyTypeLabels;
    readonly TreatmentTypeLabels = TreatmentTypeLabels;
    readonly isDeliverableStatus = isDeliverableStatus;

    readonly prescriptionId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly prescription = this.store.selectSignal(selectSelectedPrescription);
    readonly loading = this.store.selectSignal(selectSelectedPrescriptionLoading);
    readonly error = this.store.selectSignal(selectPrescriptionsError);
    readonly deliveryMutating = this.store.selectSignal(selectDeliveriesMutating);

    readonly viewMode = signal<ViewMode>('cards');
    readonly showDeleteConfirm = signal(false);
    readonly showTotalDeliveryConfirm = signal(false);
    readonly quantityPromptItem = signal<IPrescriptionItem | null>(null);

    readonly hasDeliverableItems = computed(() =>
        (this.prescription()?.items ?? []).some((item) => isDeliverableStatus(item.status)),
    );

    constructor() {
        effect(() => {
            const id = this.prescriptionId();
            if (id) {
                this.store.dispatch(PrescriptionActions.loadPrescription({ id }));
            }
        });

        this.actions$
            .pipe(
                ofType(DeliveryActions.createDeliverySuccess, DeliveryActions.deliverPrescriptionTotalSuccess),
                takeUntilDestroyed(),
            )
            .subscribe(() => this.store.dispatch(PrescriptionActions.loadPrescription({ id: this.prescriptionId() })));
    }

    ngOnDestroy(): void {
        this.store.dispatch(PrescriptionActions.clearSelectedPrescription());
    }

    onViewModeChange(mode: ViewMode): void {
        this.viewMode.set(mode);
    }

    goToEdit(): void {
        this.router.navigate(['/prescriptions', this.prescriptionId(), 'edit']);
    }

    openDeleteConfirm(): void {
        this.showDeleteConfirm.set(true);
    }

    onDeleteConfirmClosed(): void {
        this.showDeleteConfirm.set(false);
    }

    confirmDelete(): void {
        this.store.dispatch(PrescriptionActions.deletePrescription({ id: this.prescriptionId() }));
    }

    openTotalDeliveryConfirm(): void {
        this.showTotalDeliveryConfirm.set(true);
    }

    onTotalDeliveryConfirmClosed(): void {
        this.showTotalDeliveryConfirm.set(false);
    }

    confirmTotalDelivery(): void {
        this.store.dispatch(DeliveryActions.deliverPrescriptionTotal({ prescriptionId: this.prescriptionId() }));
    }

    openQuantityPrompt(item: IPrescriptionItem): void {
        this.quantityPromptItem.set(item);
    }

    closeQuantityPrompt(): void {
        this.quantityPromptItem.set(null);
    }

    onQuantitySubmitted(item: IPrescriptionItem, quantity: number): void {
        this.store.dispatch(
            DeliveryActions.createDelivery({
                payload: {
                    prescriptionItemId: item.id,
                    deliveryDate: toDateInputValue(new Date()),
                    deliveryQuantity: quantity,
                },
            }),
        );
    }

    goBack(): void {
        this.router.navigate(['/prescriptions']);
    }
}
