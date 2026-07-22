import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { ToastType } from '@core/ui/toast/models/toast.model';
import { Field } from '@shared/ui/field/field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { Modal } from '@shared/ui/modal/modal';
import { FileUploadService } from '@shared/services/file-upload.service';

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
    private readonly fileUploadService = inject(FileUploadService);
    private readonly toastService = inject(ToastService);

    readonly closed = output<void>();

    readonly mutating = this.store.selectSignal(selectMedicinesMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);

    readonly submitting = signal(false);

    readonly model = signal({
        name: '',
        eanCode: '',
        imageFile: null as File | null,
    });

    readonly medicineForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        maxLength(schema.name, 200, { message: 'O nome deve ter no máximo 200 caracteres.' });

        required(schema.eanCode, { message: 'O código EAN é obrigatório.' });
        maxLength(schema.eanCode, 14, { message: 'O código EAN deve ter no máximo 14 caracteres.' });
    });

    readonly canSubmit = computed(
        () =>
            this.medicineForm().valid() &&
            !this.mutating() &&
            !this.submitting() &&
            !!this.connectedCompany() &&
            !!this.model().imageFile,
    );

    onImageSelected(file: File): void {
        this.model.update((current) => ({ ...current, imageFile: file }));
    }

    async onSubmit(event: Event, modal: Modal): Promise<void> {
        event.preventDefault();

        const companyId = this.connectedCompany()?.id;
        const value = this.model();

        if (!this.canSubmit() || !companyId || !value.imageFile) {
            this.medicineForm().markAsTouched();
            return;
        }

        this.submitting.set(true);

        try {
            const imageUrl = await this.fileUploadService.uploadImage(value.imageFile, 'MEDICINE', value.name);

            this.store.dispatch(
                MedicineActions.createMedicine({
                    payload: {
                        name: value.name,
                        eanCode: value.eanCode,
                        imageUrl,
                        companyId,
                    },
                }),
            );

            modal.requestClose();
        } catch {
            this.toastService.show(ToastType.Error, 'Não foi possível enviar a imagem. Tente novamente.');
        } finally {
            this.submitting.set(false);
        }
    }
}
