import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { Pagination } from '@shared/ui/pagination/pagination';
import { ViewMode, ViewToggle } from '@shared/ui/view-toggle/view-toggle';

import { MedicineCreateModal } from '../../components/medicine-create-modal/medicine-create-modal';
import { MedicineFilterParams } from '../../models/medicine-api.model';
import * as MedicineActions from '../../store/medicine.actions';
import { selectAllMedicines, selectMedicinesError, selectMedicinesLoading, selectMedicinesPagination } from '../../store/medicine.selectors';

interface MedicineListFilterForm {
    name: string;
    eanCode: string;
}

const EMPTY_FILTER_FORM: MedicineListFilterForm = {
    name: '',
    eanCode: '',
};

@Component({
    selector: 'app-medicine-list',
    imports: [Pagination, ViewToggle, MedicineCreateModal],
    templateUrl: './medicine-list.html',
    styleUrl: './medicine-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineList {
    private readonly store = inject(Store);

    readonly medicines = this.store.selectSignal(selectAllMedicines);
    readonly loading = this.store.selectSignal(selectMedicinesLoading);
    readonly error = this.store.selectSignal(selectMedicinesError);
    readonly pagination = this.store.selectSignal(selectMedicinesPagination);

    private readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly viewMode = signal<ViewMode>('cards');
    readonly filterForm = signal<MedicineListFilterForm>({ ...EMPTY_FILTER_FORM });
    readonly showCreateModal = signal(false);

    private readonly requestedPage = signal(0);

    constructor() {
        effect(() => {
            const companyId = this.connectedCompanyId();

            if (companyId) {
                this.loadPage(0);
            }
        });
    }

    onViewModeChange(mode: ViewMode): void {
        this.viewMode.set(mode);
    }

    onFilterNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, name: value }));
    }

    onFilterEanCodeChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, eanCode: value }));
    }

    applyFilters(event: Event): void {
        event.preventDefault();
        this.loadPage(0);
    }

    clearFilters(): void {
        this.filterForm.set({ ...EMPTY_FILTER_FORM });
        this.loadPage(0);
    }

    retry(): void {
        this.loadPage(this.requestedPage());
    }

    goToPreviousPage(): void {
        if (this.pagination().previous) {
            this.loadPage(this.requestedPage() - 1);
        }
    }

    goToNextPage(): void {
        if (this.pagination().next) {
            this.loadPage(this.requestedPage() + 1);
        }
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    private loadPage(page: number): void {
        const companyId = this.connectedCompanyId();

        if (!companyId) {
            return;
        }

        this.requestedPage.set(page);
        this.store.dispatch(MedicineActions.loadMedicines({ companyId, page, filter: this.buildFilter() }));
    }

    private buildFilter(): MedicineFilterParams {
        const form = this.filterForm();

        return {
            name: form.name || undefined,
            eanCode: form.eanCode || undefined,
        };
    }
}
