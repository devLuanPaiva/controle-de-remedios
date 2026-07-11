import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { DateField } from '@shared/ui/date-field/date-field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { IPatient } from '@features/patient/models/patient.model';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { PatientPicker } from '../patient-picker/patient-picker';
import * as PrescriptionActions from '../../store/prescription.actions';
import { selectPrescriptionsMutating } from '../../store/prescription.selectors';

@Component({
    selector: 'app-prescription-create-form',
    imports: [DateField, ImageUploadField, PatientPicker],
    templateUrl: './prescription-create-form.html',
    styleUrl: './prescription-create-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionCreateForm {
    private readonly store = inject(Store);

    readonly maxIssueDate = toDateInputValue(new Date());

    readonly mutating = this.store.selectSignal(selectPrescriptionsMutating);

    readonly model = signal({
        patientId: '',
        issueDate: '',
        imageUrl: '',
    });

    readonly prescriptionForm = form(this.model, (schema) => {
        required(schema.patientId, { message: 'Selecione um paciente.' });

        required(schema.issueDate, { message: 'A data de emissão é obrigatória.' });
        validate(schema.issueDate, ({ value }) =>
            isNotFutureDate(value(), new Date()) ? null : { kind: 'issueDate', message: 'A data de emissão não pode ser futura.' },
        );
    });

    readonly canSubmit = computed(() => this.prescriptionForm().valid() && !this.mutating());

    onPatientSelected(patient: IPatient): void {
        this.model.update((current) => ({ ...current, patientId: patient.id }));
        this.prescriptionForm.patientId().markAsTouched();
    }

    onImageUploaded(url: string): void {
        this.model.update((current) => ({ ...current, imageUrl: url }));
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
                    imageUrl: value.imageUrl || undefined,
                },
            }),
        );
    }
}
