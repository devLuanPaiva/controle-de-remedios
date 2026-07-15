import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { UnityTypeLabels } from '@features/prescription/models/prescription-item.model';
import { DeliverQuantityModal } from '@shared/ui/deliver-quantity-modal/deliver-quantity-modal';
import { ImageFallback } from '@shared/ui/image-fallback/image-fallback';
import { PrescriptionStatusBadge } from '@shared/ui/prescription-status-badge/prescription-status-badge';
import { formatCpf } from '@shared/utils/cpf.util';
import { toDateInputValue } from '@shared/utils/date.util';

import { IEligiblePrescription, IEligiblePrescriptionItem, isDeliverableStatus } from '../../models/delivery.model';
import * as DeliveryActions from '../../store/delivery.actions';
import {
    selectDeliveriesMutating,
    selectEligiblePrescriptions,
    selectEligiblePrescriptionsLoading,
} from '../../store/delivery.selectors';
import { PatientCpfModal } from '../patient-cpf-modal/patient-cpf-modal';

@Component({
    selector: 'app-delivery-create-form',
    imports: [DatePipe, ImageFallback, PrescriptionStatusBadge, PatientCpfModal, DeliverQuantityModal],
    templateUrl: './delivery-create-form.html',
    styleUrl: './delivery-create-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryCreateForm {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly UnityTypeLabels = UnityTypeLabels;
    readonly formatCpf = formatCpf;

    readonly prescriptions = this.store.selectSignal(selectEligiblePrescriptions);
    readonly loading = this.store.selectSignal(selectEligiblePrescriptionsLoading);
    readonly mutating = this.store.selectSignal(selectDeliveriesMutating);
    private readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly showCpfModal = signal(false);
    readonly searchedCpf = signal<string | null>(null);
    readonly quantityPromptItem = signal<IEligiblePrescriptionItem | null>(null);

    readonly hasSearched = computed(() => this.searchedCpf() !== null);

    constructor() {
        this.actions$
            .pipe(
                ofType(DeliveryActions.createDeliverySuccess, DeliveryActions.deliverPrescriptionTotalSuccess),
                takeUntilDestroyed(),
            )
            .subscribe(() => this.reloadEligiblePrescriptions());
    }

    openCpfModal(): void {
        this.showCpfModal.set(true);
    }

    closeCpfModal(): void {
        this.showCpfModal.set(false);
    }

    onCpfSubmitted(cpf: string): void {
        this.searchedCpf.set(cpf);
        this.reloadEligiblePrescriptions();
    }

    hasDeliverableItems(prescription: IEligiblePrescription): boolean {
        return prescription.items.some((item) => this.isDeliverable(item));
    }

    isDeliverable(item: IEligiblePrescriptionItem): boolean {
        return isDeliverableStatus(item.status);
    }

    deliverTotal(prescriptionId: string): void {
        this.store.dispatch(DeliveryActions.deliverPrescriptionTotal({ prescriptionId }));
    }

    openQuantityPrompt(item: IEligiblePrescriptionItem): void {
        this.quantityPromptItem.set(item);
    }

    closeQuantityPrompt(): void {
        this.quantityPromptItem.set(null);
    }

    onQuantitySubmitted(item: IEligiblePrescriptionItem, quantity: number): void {
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

    private reloadEligiblePrescriptions(): void {
        const companyId = this.connectedCompanyId();
        const cpf = this.searchedCpf();

        if (companyId && cpf) {
            this.store.dispatch(DeliveryActions.loadEligiblePrescriptions({ companyId, cpf }));
        }
    }
}
