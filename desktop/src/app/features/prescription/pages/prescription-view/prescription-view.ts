import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';
import { PrescriptionStatusBadge } from '@shared/ui/prescription-status-badge/prescription-status-badge';
import { ViewMode, ViewToggle } from '@shared/ui/view-toggle/view-toggle';
import { formatCpf } from '@shared/utils/cpf.util';

import { FrequencyTypeLabels, TreatmentTypeLabels, UnityTypeLabels } from '../../models/prescription-item.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectPrescriptionsError,
    selectSelectedPrescription,
    selectSelectedPrescriptionLoading,
} from '../../store/prescription.selectors';

@Component({
    selector: 'app-prescription-view',
    imports: [DatePipe, ConfirmDialog, PrescriptionStatusBadge, ViewToggle],
    templateUrl: './prescription-view.html',
    styleUrl: './prescription-view.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionView implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly formatCpf = formatCpf;
    readonly UnityTypeLabels = UnityTypeLabels;
    readonly FrequencyTypeLabels = FrequencyTypeLabels;
    readonly TreatmentTypeLabels = TreatmentTypeLabels;

    readonly prescriptionId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly prescription = this.store.selectSignal(selectSelectedPrescription);
    readonly loading = this.store.selectSignal(selectSelectedPrescriptionLoading);
    readonly error = this.store.selectSignal(selectPrescriptionsError);

    readonly viewMode = signal<ViewMode>('cards');
    readonly showDeleteConfirm = signal(false);

    constructor() {
        effect(() => {
            const id = this.prescriptionId();
            if (id) {
                this.store.dispatch(PrescriptionActions.loadPrescription({ id }));
            }
        });
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

    goBack(): void {
        this.router.navigate(['/prescriptions']);
    }
}
