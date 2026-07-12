import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { Pagination } from '@shared/ui/pagination/pagination';
import { PrescriptionStatusBadge } from '@shared/ui/prescription-status-badge/prescription-status-badge';
import { Tabs, TabConfig } from '@shared/ui/tabs/tabs';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

import { PrescriptionCreateForm } from '../../components/prescription-create-form/prescription-create-form';
import { PrescriptionFilterParams } from '../../models/prescription-api.model';
import { PrescriptionStatus, PrescriptionStatusLabels } from '../../models/prescription.model';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectAllPrescriptions,
    selectPrescriptionsError,
    selectPrescriptionsLoading,
    selectPrescriptionsPagination,
} from '../../store/prescription.selectors';

interface PrescriptionListFilterForm {
    patientName: string;
    patientCpf: string;
    status: PrescriptionStatus | '';
    issueDate: string;
}

const EMPTY_FILTER_FORM: PrescriptionListFilterForm = {
    patientName: '',
    patientCpf: '',
    status: '',
    issueDate: '',
};

@Component({
    selector: 'app-prescription-list',
    imports: [RouterLink, DatePipe, Tabs, Pagination, PrescriptionStatusBadge, PrescriptionCreateForm],
    templateUrl: './prescription-list.html',
    styleUrl: './prescription-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionList implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly prescriptions = this.store.selectSignal(selectAllPrescriptions);
    readonly loading = this.store.selectSignal(selectPrescriptionsLoading);
    readonly error = this.store.selectSignal(selectPrescriptionsError);
    readonly pagination = this.store.selectSignal(selectPrescriptionsPagination);

    readonly tabs: TabConfig[] = [
        { id: 'list', label: 'Listagem' },
        { id: 'create', label: 'Cadastrar nova' },
    ];
    readonly activeTabId = signal('list');

    readonly statusOptions = Object.values(PrescriptionStatus);
    readonly PrescriptionStatusLabels = PrescriptionStatusLabels;

    readonly filterForm = signal<PrescriptionListFilterForm>({ ...EMPTY_FILTER_FORM });

    private readonly requestedPage = signal(0);

    constructor() {
        this.actions$
            .pipe(ofType(PrescriptionActions.createPrescriptionSuccess), takeUntilDestroyed())
            .subscribe(() => {
                this.activeTabId.set('list');
                this.loadPage(0);
            });
    }

    ngOnInit(): void {
        this.loadPage(0);
    }

    onTabChange(tabId: string): void {
        this.activeTabId.set(tabId);
    }

    onFilterPatientNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientName: value }));
    }

    onFilterPatientCpfChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientCpf: formatCpf(value) }));
    }

    onFilterStatusChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, status: value as PrescriptionStatus | '' }));
    }

    onFilterIssueDateChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, issueDate: value }));
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
        this.requestedPage.set(page);
        this.store.dispatch(PrescriptionActions.loadPrescriptions({ page, filter: this.buildFilter() }));
    }

    private buildFilter(): PrescriptionFilterParams {
        const form = this.filterForm();

        return {
            patientName: form.patientName || undefined,
            patientCpf: form.patientCpf ? onlyDigits(form.patientCpf) : undefined,
            status: form.status || undefined,
            issueDate: form.issueDate || undefined,
        };
    }
}
