import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { DateField } from '@shared/ui/date-field/date-field';
import { ImageUploadMultiField } from '@shared/ui/image-upload-multi-field/image-upload-multi-field';
import { IPatient } from '@features/patient/models/patient.model';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { PatientPicker } from '../patient-picker/patient-picker';
import { PrescriptionItemCreateRow } from '../prescription-item-create-row/prescription-item-create-row';
import { CreatePrescriptionItemRequest } from '../../models/prescription-item-api.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import { selectCreatePrescriptionErrors, selectPrescriptionsMutating } from '../../store/prescription.selectors';
import { mapItemFieldErrors } from '../../utils/item-field-errors.util';

@Component({
    selector: 'app-prescription-create-form',
    imports: [DateField, ImageUploadMultiField, PatientPicker, PrescriptionItemCreateRow],
    templateUrl: './prescription-create-form.html',
    styleUrl: './prescription-create-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionCreateForm {
    private readonly store = inject(Store);

    readonly maxIssueDate = toDateInputValue(new Date());

    readonly mutating = this.store.selectSignal(selectPrescriptionsMutating);
    readonly createErrors = this.store.selectSignal(selectCreatePrescriptionErrors);
    readonly itemErrors = computed(() => mapItemFieldErrors(this.createErrors()));

    readonly model = signal({
        patientId: '',
        issueDate: '',
        imageUrls: [] as string[],
    });

    readonly itemRows = signal<(CreatePrescriptionItemRequest | null)[]>([null]);

    readonly validItems = computed(() =>
        this.itemRows().filter((item): item is CreatePrescriptionItemRequest => item !== null),
    );

    readonly prescriptionForm = form(this.model, (schema) => {
        required(schema.patientId, { message: 'Selecione um paciente.' });

        required(schema.issueDate, { message: 'A data de emissão é obrigatória.' });
        validate(schema.issueDate, ({ value }) =>
            isNotFutureDate(value(), new Date()) ? null : { kind: 'issueDate', message: 'A data de emissão não pode ser futura.' },
        );
    });

    readonly canSubmit = computed(
        () =>
            this.prescriptionForm().valid() &&
            !this.mutating() &&
            this.validItems().length > 0 &&
            this.validItems().length === this.itemRows().length,
    );

    onPatientSelected(patient: IPatient): void {
        this.model.update((current) => ({ ...current, patientId: patient.id }));
        this.prescriptionForm.patientId().markAsTouched();
    }

    onImagesChanged(imageUrls: string[]): void {
        this.model.update((current) => ({ ...current, imageUrls }));
    }

    onItemChanged(index: number, item: CreatePrescriptionItemRequest | null): void {
        this.itemRows.update((current) => current.map((row, rowIndex) => (rowIndex === index ? item : row)));
    }

    addItemRow(): void {
        this.itemRows.update((current) => [...current, null]);
    }

    removeItemRow(index: number): void {
        if (this.itemRows().length <= 1) {
            return;
        }

        this.itemRows.update((current) => current.filter((_, rowIndex) => rowIndex !== index));
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.prescriptionForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            PrescriptionActions.createPrescription({
                payload: {
                    patientId: value.patientId,
                    issueDate: value.issueDate,
                    imageUrls: value.imageUrls.length ? value.imageUrls : undefined,
                    items: this.validItems(),
                },
            }),
        );
    }
}
