import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

import { PatientCreateModal } from '../patient-create-modal/patient-create-modal';
import * as PatientActions from '../../store/patient.actions';
import { PatientFilterParams } from '../../models/patient-api.model';
import {
    selectAllPatients,
    selectPatientsError,
    selectPatientsLoading,
    selectPatientsPagination,
} from '../../store/patient.selectors';

interface PatientListFilterForm {
    name: string;
    cpf: string;
}

const EMPTY_FILTER_FORM: PatientListFilterForm = {
    name: '',
    cpf: '',
};

@Component({
    selector: 'app-patient-list',
    imports: [RouterLink, DatePipe, PatientCreateModal],
    templateUrl: './patient-list.html',
    styleUrl: './patient-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientList implements OnInit {
    private readonly store = inject(Store);

    readonly patients = this.store.selectSignal(selectAllPatients);
    readonly loading = this.store.selectSignal(selectPatientsLoading);
    readonly error = this.store.selectSignal(selectPatientsError);
    readonly pagination = this.store.selectSignal(selectPatientsPagination);
    readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly showCreateModal = signal(false);
    readonly filterForm = signal<PatientListFilterForm>({ ...EMPTY_FILTER_FORM });

    private readonly requestedPage = signal(0);

    ngOnInit(): void {
        this.loadPage(0);
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    onFilterNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, name: value }));
    }

    onFilterCpfChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, cpf: formatCpf(value) }));
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
        this.store.dispatch(PatientActions.loadPatients({ page, filter: this.buildFilter() }));
    }

    private buildFilter(): PatientFilterParams {
        const form = this.filterForm();

        return {
            name: form.name || undefined,
            cpf: form.cpf ? onlyDigits(form.cpf) : undefined,
            companyId: this.connectedCompanyId() ?? undefined,
        };
    }
}
