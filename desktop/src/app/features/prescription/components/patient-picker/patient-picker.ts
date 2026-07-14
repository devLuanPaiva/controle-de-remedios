import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import * as PatientActions from '@features/patient/store/patient.actions';
import { PatientCreateModal } from '@features/patient/components/patient-create-modal/patient-create-modal';
import { IPatient } from '@features/patient/models/patient.model';
import { PatientService } from '@features/patient/services/patient.service';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

@Component({
    selector: 'app-patient-picker',
    imports: [PatientCreateModal],
    templateUrl: './patient-picker.html',
    styleUrl: './patient-picker.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPicker {
    private readonly patientService = inject(PatientService);
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly patientSelected = output<IPatient>();

    readonly formatCpf = formatCpf;

    private readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly searchTerm = signal('');
    readonly results = signal<IPatient[]>([]);
    readonly searching = signal(false);
    readonly searched = signal(false);
    readonly selectedPatient = signal<IPatient | null>(null);
    readonly showQuickCreate = signal(false);

    constructor() {
        this.actions$
            .pipe(ofType(PatientActions.createPatientSuccess), takeUntilDestroyed())
            .subscribe(({ patient }) => {
                this.selectPatient(patient);
                this.showQuickCreate.set(false);
            });
    }

    onSearchTermChange(value: string): void {
        this.searchTerm.set(value);
    }

    search(event: Event): void {
        event.preventDefault();

        const term = this.searchTerm().trim();

        if (!term) {
            return;
        }

        this.searching.set(true);

        const isNumeric = /^\d+$/.test(onlyDigits(term));

        this.patientService
            .getPatients(0, {
                companyId: this.connectedCompanyId() ?? undefined,
                name: isNumeric ? undefined : term,
                cpf: isNumeric ? onlyDigits(term) : undefined,
            })
            .subscribe({
                next: (page) => {
                    this.results.set(page.patients);
                    this.searching.set(false);
                    this.searched.set(true);
                },
                error: () => {
                    this.searching.set(false);
                    this.searched.set(true);
                },
            });
    }

    onResultChange(patientId: string): void {
        const patient = this.results().find((candidate) => candidate.id === patientId) ?? null;
        this.selectedPatient.set(patient);

        if (patient) {
            this.patientSelected.emit(patient);
        }
    }

    openQuickCreate(): void {
        this.showQuickCreate.set(true);
    }

    closeQuickCreate(): void {
        this.showQuickCreate.set(false);
    }

    private selectPatient(patient: IPatient): void {
        this.selectedPatient.set(patient);
        this.results.set([patient]);
        this.patientSelected.emit(patient);
    }
}
