import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { UnityTypeLabels } from '@features/prescription/models/prescription-item.model';
import { Pagination } from '@shared/ui/pagination/pagination';
import { Tabs, TabConfig } from '@shared/ui/tabs/tabs';
import { ViewMode, ViewToggle } from '@shared/ui/view-toggle/view-toggle';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

import { DeliveryCreateForm } from '../../components/delivery-create-form/delivery-create-form';
import { DeliveryFilterParams } from '../../models/delivery-api.model';
import * as DeliveryActions from '../../store/delivery.actions';
import { selectAllDeliveries, selectDeliveriesError, selectDeliveriesLoading, selectDeliveriesPagination } from '../../store/delivery.selectors';

interface DeliveryListFilterForm {
    patientName: string;
    patientCpf: string;
    medicineName: string;
}

const EMPTY_FILTER_FORM: DeliveryListFilterForm = {
    patientName: '',
    patientCpf: '',
    medicineName: '',
};

@Component({
    selector: 'app-delivery-list',
    imports: [DatePipe, Tabs, ViewToggle, Pagination, DeliveryCreateForm],
    templateUrl: './delivery-list.html',
    styleUrl: './delivery-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryList implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly formatCpf = formatCpf;
    readonly UnityTypeLabels = UnityTypeLabels;

    readonly deliveries = this.store.selectSignal(selectAllDeliveries);
    readonly loading = this.store.selectSignal(selectDeliveriesLoading);
    readonly error = this.store.selectSignal(selectDeliveriesError);
    readonly pagination = this.store.selectSignal(selectDeliveriesPagination);
    private readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly tabs: TabConfig[] = [
        { id: 'list', label: 'Listagem' },
        { id: 'create', label: 'Nova entrega' },
    ];
    readonly activeTabId = signal('list');

    readonly viewMode = signal<ViewMode>('table');
    readonly filterForm = signal<DeliveryListFilterForm>({ ...EMPTY_FILTER_FORM });

    private readonly requestedPage = signal(0);

    constructor() {
        this.actions$
            .pipe(
                ofType(DeliveryActions.createDeliverySuccess, DeliveryActions.deliverPrescriptionTotalSuccess),
                takeUntilDestroyed(),
            )
            .subscribe(() => this.loadPage(0));
    }

    ngOnInit(): void {
        this.loadPage(0);
    }

    onTabChange(tabId: string): void {
        this.activeTabId.set(tabId);

        if (tabId === 'list') {
            this.loadPage(0);
        }
    }

    onViewModeChange(mode: ViewMode): void {
        this.viewMode.set(mode);
    }

    onFilterPatientNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientName: value }));
    }

    onFilterPatientCpfChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientCpf: formatCpf(value) }));
    }

    onFilterMedicineNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, medicineName: value }));
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

    private loadPage(page: number): void {
        const companyId = this.connectedCompanyId();

        if (!companyId) {
            return;
        }

        this.requestedPage.set(page);
        this.store.dispatch(DeliveryActions.loadDeliveries({ companyId, page, filter: this.buildFilter() }));
    }

    private buildFilter(): DeliveryFilterParams {
        const form = this.filterForm();

        return {
            patientName: form.patientName || undefined,
            patientCpf: form.patientCpf ? onlyDigits(form.patientCpf) : undefined,
            medicineName: form.medicineName || undefined,
        };
    }
}
