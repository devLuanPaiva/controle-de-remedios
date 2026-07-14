import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { CreatePrescriptionItemRequest } from '../../models/prescription-item-api.model';
import {
    FrequencyType,
    FrequencyTypeLabels,
    TreatmentType,
    TreatmentTypeLabels,
    UnityType,
    UnityTypeLabels,
} from '../../models/prescription-item.model';
import { MedicinePicker, MedicinePickerSelection } from '../medicine-picker/medicine-picker';

interface ItemRowModel {
    medicineSelection: MedicinePickerSelection | null;
    dosage: string;
    prescribedQuantity: number | null;
    unityType: UnityType;
    frequency: number | null;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number | null;
}

const EMPTY_MODEL: ItemRowModel = {
    medicineSelection: null,
    dosage: '',
    prescribedQuantity: null,
    unityType: UnityType.BOX,
    frequency: null,
    frequencyType: FrequencyType.PER_DAY,
    treatmentType: TreatmentType.CONTINUOUS,
    treatmentDays: null,
};

function buildPayload(model: ItemRowModel): CreatePrescriptionItemRequest | null {
    if (
        !model.medicineSelection ||
        !model.dosage.trim() ||
        !model.prescribedQuantity ||
        model.prescribedQuantity <= 0 ||
        !model.frequency ||
        model.frequency <= 0 ||
        !model.treatmentDays ||
        model.treatmentDays <= 0
    ) {
        return null;
    }

    const medicineFields =
        'medicineId' in model.medicineSelection
            ? { medicineId: model.medicineSelection.medicineId }
            : { medicine: model.medicineSelection.medicine };

    return {
        ...medicineFields,
        dosage: model.dosage.trim(),
        prescribedQuantity: model.prescribedQuantity,
        unityType: model.unityType,
        frequency: model.frequency,
        frequencyType: model.frequencyType,
        treatmentType: model.treatmentType,
        treatmentDays: model.treatmentDays,
    };
}

@Component({
    selector: 'app-prescription-item-create-row',
    imports: [MedicinePicker],
    templateUrl: './prescription-item-create-row.html',
    styleUrl: './prescription-item-create-row.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionItemCreateRow {
    readonly index = input.required<number>();
    readonly canRemove = input(true);

    readonly itemChanged = output<CreatePrescriptionItemRequest | null>();
    readonly removed = output<void>();

    readonly unityOptions = Object.values(UnityType);
    readonly UnityTypeLabels = UnityTypeLabels;

    readonly frequencyOptions = Object.values(FrequencyType);
    readonly FrequencyTypeLabels = FrequencyTypeLabels;

    readonly treatmentOptions = Object.values(TreatmentType);
    readonly TreatmentTypeLabels = TreatmentTypeLabels;

    readonly model = signal<ItemRowModel>({ ...EMPTY_MODEL });

    onMedicineSelected(selection: MedicinePickerSelection): void {
        this.updateModel((current) => ({ ...current, medicineSelection: selection }));
    }

    onMedicineCleared(): void {
        this.updateModel((current) => ({ ...current, medicineSelection: null }));
    }

    onDosageChange(value: string): void {
        this.updateModel((current) => ({ ...current, dosage: value }));
    }

    onPrescribedQuantityChange(value: string): void {
        this.updateModel((current) => ({ ...current, prescribedQuantity: value ? Number(value) : null }));
    }

    onUnityTypeChange(value: string): void {
        this.updateModel((current) => ({ ...current, unityType: value as UnityType }));
    }

    onFrequencyChange(value: string): void {
        this.updateModel((current) => ({ ...current, frequency: value ? Number(value) : null }));
    }

    onFrequencyTypeChange(value: string): void {
        this.updateModel((current) => ({ ...current, frequencyType: value as FrequencyType }));
    }

    onTreatmentTypeChange(value: string): void {
        this.updateModel((current) => ({ ...current, treatmentType: value as TreatmentType }));
    }

    onTreatmentDaysChange(value: string): void {
        this.updateModel((current) => ({ ...current, treatmentDays: value ? Number(value) : null }));
    }

    onRemove(): void {
        this.removed.emit();
    }

    private updateModel(updater: (current: ItemRowModel) => ItemRowModel): void {
        this.model.update(updater);
        this.itemChanged.emit(buildPayload(this.model()));
    }
}
