import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';

import { ImageFallback } from '@shared/ui/image-fallback/image-fallback';
import { diffPrimitive } from '@shared/utils/diff.util';

import { PrescriptionStatus, PrescriptionStatusLabels } from '../../models/prescription.model';
import { UpdatePrescriptionItemRequest } from '../../models/prescription-item-api.model';
import {
    FrequencyType,
    FrequencyTypeLabels,
    IPrescriptionItem,
    TreatmentType,
    TreatmentTypeLabels,
    UnityType,
    UnityTypeLabels,
} from '../../models/prescription-item.model';

interface EditCardModel {
    status: PrescriptionStatus;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    frequency: number;
    frequencyType: FrequencyType;
    treatmentType: TreatmentType;
    treatmentDays: number;
    observations: string;
    startDate: string;
    receivedQuantity: number;
    deliveredQuantity: number;
}

function toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function toModel(item: IPrescriptionItem): EditCardModel {
    return {
        status: item.status,
        dosage: item.dosage,
        prescribedQuantity: item.prescribedQuantity,
        unityType: item.unityType,
        frequency: item.frequency,
        frequencyType: item.frequencyType,
        treatmentType: item.treatmentType,
        treatmentDays: item.treatmentDays,
        observations: item.observations ?? '',
        startDate: item.startDate ? toDateInputValue(item.startDate) : '',
        receivedQuantity: item.receivedQuantity ?? 0,
        deliveredQuantity: item.deliveredQuantity ?? 0,
    };
}

@Component({
    selector: 'app-prescription-item-edit-card',
    imports: [ImageFallback],
    templateUrl: './prescription-item-edit-card.html',
    styleUrl: './prescription-item-edit-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionItemEditCard {
    readonly item = input.required<IPrescriptionItem>();
    readonly saving = input.required<boolean>();

    readonly save = output<UpdatePrescriptionItemRequest>();

    readonly statusOptions = Object.values(PrescriptionStatus);
    readonly PrescriptionStatusLabels = PrescriptionStatusLabels;

    readonly unityOptions = Object.values(UnityType);
    readonly UnityTypeLabels = UnityTypeLabels;

    readonly frequencyOptions = Object.values(FrequencyType);
    readonly FrequencyTypeLabels = FrequencyTypeLabels;

    readonly treatmentOptions = Object.values(TreatmentType);
    readonly TreatmentTypeLabels = TreatmentTypeLabels;

    readonly model = signal<EditCardModel>({
        status: PrescriptionStatus.PENDING,
        dosage: '',
        prescribedQuantity: 0,
        unityType: UnityType.BOX,
        frequency: 0,
        frequencyType: FrequencyType.PER_DAY,
        treatmentType: TreatmentType.CONTINUOUS,
        treatmentDays: 0,
        observations: '',
        startDate: '',
        receivedQuantity: 0,
        deliveredQuantity: 0,
    });

    readonly canSave = computed(() => {
        const value = this.model();

        return (
            value.dosage.trim().length > 0 &&
            value.prescribedQuantity > 0 &&
            value.frequency > 0 &&
            value.treatmentDays > 0 &&
            value.receivedQuantity >= 0 &&
            value.deliveredQuantity >= 0 &&
            !this.saving()
        );
    });

    constructor() {
        effect(() => {
            this.model.set(toModel(this.item()));
        });
    }

    onStatusChange(value: string): void {
        this.model.update((current) => ({ ...current, status: value as PrescriptionStatus }));
    }

    onDosageChange(value: string): void {
        this.model.update((current) => ({ ...current, dosage: value }));
    }

    onPrescribedQuantityChange(value: string): void {
        this.model.update((current) => ({ ...current, prescribedQuantity: Number(value) }));
    }

    onUnityTypeChange(value: string): void {
        this.model.update((current) => ({ ...current, unityType: value as UnityType }));
    }

    onFrequencyChange(value: string): void {
        this.model.update((current) => ({ ...current, frequency: Number(value) }));
    }

    onFrequencyTypeChange(value: string): void {
        this.model.update((current) => ({ ...current, frequencyType: value as FrequencyType }));
    }

    onTreatmentTypeChange(value: string): void {
        this.model.update((current) => ({ ...current, treatmentType: value as TreatmentType }));
    }

    onTreatmentDaysChange(value: string): void {
        this.model.update((current) => ({ ...current, treatmentDays: Number(value) }));
    }

    onObservationsChange(value: string): void {
        this.model.update((current) => ({ ...current, observations: value }));
    }

    onStartDateChange(value: string): void {
        this.model.update((current) => ({ ...current, startDate: value }));
    }

    onReceivedQuantityChange(value: string): void {
        this.model.update((current) => ({ ...current, receivedQuantity: Number(value) }));
    }

    onDeliveredQuantityChange(value: string): void {
        this.model.update((current) => ({ ...current, deliveredQuantity: Number(value) }));
    }

    onSave(event: Event): void {
        event.preventDefault();

        if (!this.canSave()) {
            return;
        }

        const original = this.item();
        const value = this.model();
        const observations = value.observations.trim();
        const originalStartDate = original.startDate ? toDateInputValue(original.startDate) : '';

        this.save.emit({
            status: diffPrimitive(original.status, value.status),
            dosage: diffPrimitive(original.dosage, value.dosage.trim()),
            prescribedQuantity: diffPrimitive(original.prescribedQuantity, value.prescribedQuantity),
            unityType: diffPrimitive(original.unityType, value.unityType),
            frequency: diffPrimitive(original.frequency, value.frequency),
            frequencyType: diffPrimitive(original.frequencyType, value.frequencyType),
            treatmentType: diffPrimitive(original.treatmentType, value.treatmentType),
            treatmentDays: diffPrimitive(original.treatmentDays, value.treatmentDays),
            observations: diffPrimitive(original.observations ?? '', observations) || undefined,
            startDate: diffPrimitive(originalStartDate, value.startDate) || undefined,
            receivedQuantity: diffPrimitive(original.receivedQuantity ?? 0, value.receivedQuantity),
            deliveredQuantity: diffPrimitive(original.deliveredQuantity ?? 0, value.deliveredQuantity),
        });
    }
}
