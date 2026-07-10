import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, form, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { Field } from '@shared/ui/field/field';
import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { DateField } from '@shared/ui/date-field/date-field';
import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';
import { DangerCard } from '@shared/ui/danger-card/danger-card';
import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { PatientAccountPanel } from '../../components/patient-account-panel/patient-account-panel';
import * as PatientActions from '../../store/patient.actions';
import {
    selectPatientsError,
    selectPatientsMutating,
    selectSelectedPatient,
    selectSelectedPatientLoading,
} from '../../store/patient.selectors';

@Component({
    selector: 'app-patient-edit',
    imports: [FormField, Field, CpfField, DateField, ConfirmDialog, DangerCard, PatientAccountPanel],
    templateUrl: './patient-edit.html',
    styleUrl: './patient-edit.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientEdit implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly maxBirthDate = toDateInputValue(new Date());
    readonly formatCpf = formatCpf;

    readonly patientId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly patient = this.store.selectSignal(selectSelectedPatient);
    readonly loading = this.store.selectSignal(selectSelectedPatientLoading);
    readonly error = this.store.selectSignal(selectPatientsError);
    readonly mutating = this.store.selectSignal(selectPatientsMutating);

    readonly showDeleteConfirm = signal(false);

    readonly model = signal({
        name: '',
        cpf: '',
        birthDate: '',
    });

    readonly editForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        minLength(schema.name, 3, { message: 'O nome deve ter ao menos 3 caracteres.' });

        required(schema.cpf, { message: 'O CPF é obrigatório.' });
        validate(schema.cpf, ({ value }) => (isValidCpf(value()) ? null : { kind: 'cpf', message: 'CPF inválido.' }));

        required(schema.birthDate, { message: 'A data de nascimento é obrigatória.' });
        validate(schema.birthDate, ({ value }) =>
            isNotFutureDate(value(), new Date()) ? null : { kind: 'birthDate', message: 'A data de nascimento não pode ser futura.' },
        );
    });

    readonly canSubmit = computed(() => this.editForm().valid() && !this.mutating());

    constructor() {
        effect(() => {
            const id = this.patientId();
            if (id) {
                this.store.dispatch(PatientActions.loadPatient({ id }));
            }
        });

        effect(() => {
            const patient = this.patient();
            if (patient) {
                this.model.set({
                    name: patient.name,
                    cpf: formatCpf(patient.cpf),
                    birthDate: toDateInputValue(patient.birthDate),
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.store.dispatch(PatientActions.clearSelectedPatient());
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.editForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            PatientActions.updatePatient({
                id: this.patientId(),
                payload: {
                    name: value.name,
                    cpf: onlyDigits(value.cpf),
                    birthDate: value.birthDate,
                },
            }),
        );
    }

    openDeleteConfirm(): void {
        this.showDeleteConfirm.set(true);
    }

    onDeleteConfirmClosed(): void {
        this.showDeleteConfirm.set(false);
    }

    confirmDelete(): void {
        this.store.dispatch(PatientActions.deletePatient({ id: this.patientId() }));
    }

    goBack(): void {
        this.router.navigate(['/patients']);
    }
}
