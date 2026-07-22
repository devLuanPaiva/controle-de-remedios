import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { DateField } from '@shared/ui/date-field/date-field';
import { ImageUploadMultiField, ImageUploadMultiFieldChange } from '@shared/ui/image-upload-multi-field/image-upload-multi-field';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { ToastType } from '@core/ui/toast/models/toast.model';
import { FileUploadService } from '@shared/services/file-upload.service';
import { IPatient } from '@features/patient/models/patient.model';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { PatientPicker } from '../patient-picker/patient-picker';
import { PrescriptionItemCreateRow } from '../prescription-item-create-row/prescription-item-create-row';
import { CreatePrescriptionItemRequest, CreatePrescriptionItemRequestDraft } from '../../models/prescription-item-api.model';
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
    private readonly fileUploadService = inject(FileUploadService);
    private readonly toastService = inject(ToastService);

    readonly maxIssueDate = toDateInputValue(new Date());

    readonly mutating = this.store.selectSignal(selectPrescriptionsMutating);
    readonly createErrors = this.store.selectSignal(selectCreatePrescriptionErrors);
    readonly itemErrors = computed(() => mapItemFieldErrors(this.createErrors()));

    readonly submitting = signal(false);
    readonly pendingImages = signal<ImageUploadMultiFieldChange>({ keptUrls: [], newFiles: [] });

    readonly model = signal({
        patientId: '',
        issueDate: '',
    });

    readonly itemRows = signal<(CreatePrescriptionItemRequestDraft | null)[]>([null]);

    readonly validItems = computed(() =>
        this.itemRows().filter((item): item is CreatePrescriptionItemRequestDraft => item !== null),
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
            !this.submitting() &&
            this.validItems().length > 0 &&
            this.validItems().length === this.itemRows().length,
    );

    onPatientSelected(patient: IPatient): void {
        this.model.update((current) => ({ ...current, patientId: patient.id }));
        this.prescriptionForm.patientId().markAsTouched();
    }

    onImagesChanged(change: ImageUploadMultiFieldChange): void {
        this.pendingImages.set(change);
    }

    onItemChanged(index: number, item: CreatePrescriptionItemRequestDraft | null): void {
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

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.prescriptionForm().markAsTouched();
            return;
        }

        const value = this.model();
        const { keptUrls, newFiles } = this.pendingImages();

        this.submitting.set(true);

        try {
            const uploadedImageUrls: string[] = [];

            for (const file of newFiles) {
                uploadedImageUrls.push(await this.fileUploadService.uploadImage(file, 'PRESCRIPTION'));
            }

            const imageUrls = [...keptUrls, ...uploadedImageUrls];
            const items = await Promise.all(this.validItems().map((item) => this.resolveItem(item)));

            this.store.dispatch(
                PrescriptionActions.createPrescription({
                    payload: {
                        patientId: value.patientId,
                        issueDate: value.issueDate,
                        imageUrls: imageUrls.length ? imageUrls : undefined,
                        items,
                    },
                }),
            );
        } catch {
            this.toastService.show(ToastType.Error, 'Não foi possível enviar uma das imagens. Tente novamente.');
        } finally {
            this.submitting.set(false);
        }
    }

    private async resolveItem(item: CreatePrescriptionItemRequestDraft): Promise<CreatePrescriptionItemRequest> {
        const { medicine, ...rest } = item;

        if (!medicine) {
            return rest;
        }

        const { imageFile, ...medicineFields } = medicine;

        const imageUrl = imageFile
            ? await this.fileUploadService.uploadImage(imageFile, 'MEDICINE', medicineFields.name)
            : undefined;

        return { ...rest, medicine: { ...medicineFields, imageUrl } };
    }
}
