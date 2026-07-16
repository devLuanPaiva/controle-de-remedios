import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { DateField } from '@shared/ui/date-field/date-field';
import { ImageUploadMultiField } from '@shared/ui/image-upload-multi-field/image-upload-multi-field';
import { formatCpf } from '@shared/utils/cpf.util';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';
import { diffPrimitive, diffStringArray } from '@shared/utils/diff.util';

import { PrescriptionItemEditCard } from '../../components/prescription-item-edit-card/prescription-item-edit-card';
import { UpdatePrescriptionItemRequest } from '../../models/prescription-item-api.model';
import { UpdatePrescriptionRequest } from '../../models/prescription-api.model';
import { PrescriptionStatus, PrescriptionStatusLabels } from '../../models/prescription.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectMutatingItemIds,
    selectPrescriptionsError,
    selectPrescriptionsMutating,
    selectSelectedPrescription,
    selectSelectedPrescriptionLoading,
} from '../../store/prescription.selectors';

@Component({
    selector: 'app-prescription-edit',
    imports: [DateField, ImageUploadMultiField, PrescriptionItemEditCard],
    templateUrl: './prescription-edit.html',
    styleUrl: './prescription-edit.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionEdit implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly maxIssueDate = toDateInputValue(new Date());
    readonly formatCpf = formatCpf;
    readonly statusOptions = Object.values(PrescriptionStatus);
    readonly PrescriptionStatusLabels = PrescriptionStatusLabels;

    readonly prescriptionId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly prescription = this.store.selectSignal(selectSelectedPrescription);
    readonly loading = this.store.selectSignal(selectSelectedPrescriptionLoading);
    readonly error = this.store.selectSignal(selectPrescriptionsError);
    readonly mutating = this.store.selectSignal(selectPrescriptionsMutating);
    readonly mutatingItemIds = this.store.selectSignal(selectMutatingItemIds);

    readonly model = signal({
        status: PrescriptionStatus.PENDING,
        issueDate: '',
        imageUrls: [] as string[],
    });

    readonly editForm = form(this.model, (schema) => {
        required(schema.status, { message: 'Selecione um status.' });

        required(schema.issueDate, { message: 'A data de emissão é obrigatória.' });
        validate(schema.issueDate, ({ value }) =>
            isNotFutureDate(value(), new Date()) ? null : { kind: 'issueDate', message: 'A data de emissão não pode ser futura.' },
        );
    });

    readonly canSubmit = computed(() => this.editForm().valid() && !this.mutating());

    constructor() {
        effect(() => {
            const id = this.prescriptionId();
            if (id) {
                this.store.dispatch(PrescriptionActions.loadPrescription({ id }));
            }
        });

        effect(() => {
            const prescription = this.prescription();
            if (prescription) {
                this.model.set({
                    status: prescription.status,
                    issueDate: toDateInputValue(prescription.issueDate),
                    imageUrls: prescription.imageUrls,
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.store.dispatch(PrescriptionActions.clearSelectedPrescription());
    }

    onStatusChange(status: string): void {
        this.model.update((current) => ({ ...current, status: status as PrescriptionStatus }));
    }

    onImagesChanged(imageUrls: string[]): void {
        this.model.update((current) => ({ ...current, imageUrls }));
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.editForm().markAsTouched();
            return;
        }

        const original = this.prescription();

        if (!original) {
            return;
        }

        const value = this.model();

        const payload: UpdatePrescriptionRequest = {
            status: diffPrimitive(original.status, value.status),
            issueDate: diffPrimitive(toDateInputValue(original.issueDate), value.issueDate),
            imageUrls: diffStringArray(original.imageUrls, value.imageUrls),
        };

        this.store.dispatch(
            PrescriptionActions.updatePrescription({
                id: this.prescriptionId(),
                payload,
            }),
        );
    }

    goBack(): void {
        this.router.navigate(['/prescriptions']);
    }

    onItemSave(itemId: string, payload: UpdatePrescriptionItemRequest): void {
        this.store.dispatch(PrescriptionActions.updatePrescriptionItem({ id: itemId, payload }));
    }
}
