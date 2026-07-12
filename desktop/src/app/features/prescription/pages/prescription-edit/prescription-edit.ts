import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { DateField } from '@shared/ui/date-field/date-field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { formatCpf } from '@shared/utils/cpf.util';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { PrescriptionStatus, PrescriptionStatusLabels } from '../../models/prescription.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectPrescriptionsError,
    selectPrescriptionsMutating,
    selectSelectedPrescription,
    selectSelectedPrescriptionLoading,
} from '../../store/prescription.selectors';

@Component({
    selector: 'app-prescription-edit',
    imports: [DateField, ImageUploadField],
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

    readonly model = signal({
        status: PrescriptionStatus.PENDING,
        issueDate: '',
        imageUrl: '',
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
                    imageUrl: prescription.imageUrl ?? '',
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

    onImageUploaded(url: string): void {
        this.model.update((current) => ({ ...current, imageUrl: url }));
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.editForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            PrescriptionActions.updatePrescription({
                id: this.prescriptionId(),
                payload: {
                    status: value.status,
                    issueDate: value.issueDate,
                    imageUrl: value.imageUrl || undefined,
                },
            }),
        );
    }

    goBack(): void {
        this.router.navigate(['/prescriptions']);
    }
}
