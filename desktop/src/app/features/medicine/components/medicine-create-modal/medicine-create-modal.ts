import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { Field } from '@shared/ui/field/field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { Modal } from '@shared/ui/modal/modal';

import * as MedicineActions from '../../store/medicine.actions';
import { selectMedicinesMutating } from '../../store/medicine.selectors';

@Component({
    selector: 'app-medicine-create-modal',
    imports: [FormField, Field, ImageUploadField, Modal],
    templateUrl: './medicine-create-modal.html',
    styleUrl: './medicine-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineCreateModal {
    private readonly store = inject(Store);

    readonly closed = output<void>();

    readonly mutating = this.store.selectSignal(selectMedicinesMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);

    readonly model = signal({
        name: '',
        eanCode: '',
        imageUrl: '',
    });

    readonly medicineForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        maxLength(schema.name, 200, { message: 'O nome deve ter no máximo 200 caracteres.' });

        required(schema.eanCode, { message: 'O código EAN é obrigatório.' });
        maxLength(schema.eanCode, 14, { message: 'O código EAN deve ter no máximo 14 caracteres.' });
    });

    readonly canSubmit = computed(
        () => this.medicineForm().valid() && !this.mutating() && !!this.connectedCompany() && !!this.model().imageUrl,
    );

    onImageUploaded(imageUrl: string): void {
        this.model.update((current) => ({ ...current, imageUrl }));
    }

    onSubmit(event: Event, modal: Modal): void {
        event.preventDefault();

        const companyId = this.connectedCompany()?.id;

        if (!this.canSubmit() || !companyId) {
            this.medicineForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            MedicineActions.createMedicine({
                payload: {
                    name: value.name,
                    eanCode: value.eanCode,
                    imageUrl: value.imageUrl,
                    companyId,
                },
            }),
        );

        modal.requestClose();
    }
}
