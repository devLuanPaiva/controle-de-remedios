import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { IMedicine } from '@features/medicine/models/medicine.model';
import { MedicineService } from '@features/medicine/services/medicine.service';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { Field } from '@shared/ui/field/field';

import { CreatePrescriptionItemMedicine } from '../../models/prescription-item-api.model';

export type MedicinePickerSelection = { medicineId: string } | { medicine: CreatePrescriptionItemMedicine };

type PickerSelection = { type: 'existing'; medicine: IMedicine } | { type: 'new'; name: string } | null;

@Component({
    selector: 'app-medicine-picker',
    imports: [Field, ImageUploadField],
    templateUrl: './medicine-picker.html',
    styleUrl: './medicine-picker.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicinePicker {
    private readonly medicineService = inject(MedicineService);
    private readonly store = inject(Store);

    readonly idPrefix = input.required<string>();

    readonly medicineSelected = output<MedicinePickerSelection>();
    readonly cleared = output<void>();

    private readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly searchTerm = signal('');
    readonly results = signal<IMedicine[]>([]);
    readonly searching = signal(false);
    readonly searched = signal(false);

    readonly selection = signal<PickerSelection>(null);
    readonly showQuickCreate = signal(false);

    readonly newMedicineName = signal('');
    readonly newMedicineEanCode = signal('');
    readonly newMedicineImageUrl = signal<string | null>(null);

    onSearchTermChange(value: string): void {
        this.searchTerm.set(value);
    }

    search(event: Event): void {
        event.preventDefault();

        const companyId = this.connectedCompanyId();
        const term = this.searchTerm().trim();

        if (!companyId || !term) {
            return;
        }

        this.searching.set(true);

        const isNumeric = /^\d+$/.test(term);

        this.medicineService
            .getCompanyMedicines(companyId, 0, {
                name: isNumeric ? undefined : term,
                eanCode: isNumeric ? term : undefined,
            })
            .subscribe({
                next: (page) => {
                    this.results.set(page.medicines);
                    this.searching.set(false);
                    this.searched.set(true);
                },
                error: () => {
                    this.searching.set(false);
                    this.searched.set(true);
                },
            });
    }

    onResultChange(medicineId: string): void {
        const medicine = this.results().find((candidate) => candidate.id === medicineId);

        if (!medicine) {
            return;
        }

        this.selection.set({ type: 'existing', medicine });
        this.medicineSelected.emit({ medicineId: medicine.id });
    }

    openQuickCreate(): void {
        this.showQuickCreate.set(true);
    }

    closeQuickCreate(): void {
        this.showQuickCreate.set(false);
    }

    onNewMedicineNameChange(value: string): void {
        this.newMedicineName.set(value);
    }

    onNewMedicineEanCodeChange(value: string): void {
        this.newMedicineEanCode.set(value);
    }

    onNewMedicineImageUploaded(imageUrl: string): void {
        this.newMedicineImageUrl.set(imageUrl);
    }

    get canConfirmQuickCreate(): boolean {
        return this.newMedicineName().trim().length > 0;
    }

    confirmQuickCreate(): void {
        const name = this.newMedicineName().trim();

        if (!name) {
            return;
        }

        const eanCode = this.newMedicineEanCode().trim();
        const imageUrl = this.newMedicineImageUrl();

        this.selection.set({ type: 'new', name });
        this.medicineSelected.emit({
            medicine: {
                name,
                eanCode: eanCode || undefined,
                imageUrl: imageUrl || undefined,
            },
        });

        this.showQuickCreate.set(false);
        this.newMedicineName.set('');
        this.newMedicineEanCode.set('');
        this.newMedicineImageUrl.set(null);
    }

    clearSelection(): void {
        this.selection.set(null);
        this.cleared.emit();
    }
}
