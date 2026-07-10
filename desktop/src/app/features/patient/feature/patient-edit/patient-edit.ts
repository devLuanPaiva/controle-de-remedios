import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { UserRole } from '@features/users/models/user.model';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

import * as PatientActions from '../../store/patient.actions';
import {
    selectPatientAccountMutating,
    selectPatientsError,
    selectPatientsMutating,
    selectSelectedPatient,
    selectSelectedPatientLoading,
} from '../../store/patient.selectors';

const RANDOM_CHAR_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

function generateRandomSecret(length = 12): string {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    return Array.from(values, (value) => RANDOM_CHAR_POOL[value % RANDOM_CHAR_POOL.length]).join('');
}

function isNotFutureDate(value: string): boolean {
    if (!value) {
        return true;
    }

    return value <= new Date().toISOString().slice(0, 10);
}

function toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
}

@Component({
    selector: 'app-patient-edit',
    imports: [FormField, RoleBadge],
    templateUrl: './patient-edit.html',
    styleUrl: './patient-edit.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientEdit implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');
    private readonly removeAccountDialogRef = viewChild<ElementRef<HTMLDialogElement>>('removeAccountDialog');

    readonly PatientRole = UserRole.PATIENT;
    readonly maxBirthDate = new Date().toISOString().slice(0, 10);
    readonly formatCpf = formatCpf;

    readonly patientId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly patient = this.store.selectSignal(selectSelectedPatient);
    readonly loading = this.store.selectSignal(selectSelectedPatientLoading);
    readonly error = this.store.selectSignal(selectPatientsError);
    readonly mutating = this.store.selectSignal(selectPatientsMutating);
    readonly accountMutating = this.store.selectSignal(selectPatientAccountMutating);

    readonly showDeleteConfirm = signal(false);
    readonly showRemoveAccountConfirm = signal(false);
    readonly showAccountPassword = signal(false);

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
            isNotFutureDate(value()) ? null : { kind: 'birthDate', message: 'A data de nascimento não pode ser futura.' },
        );
    });

    readonly canSubmit = computed(() => this.editForm().valid() && !this.mutating());

    readonly accountModel = signal({
        email: '',
        password: '',
    });

    readonly accountForm = form(this.accountModel, (schema) => {
        required(schema.email, { message: 'O e-mail é obrigatório.' });
        email(schema.email, { message: 'O e-mail deve ser válido.' });

        required(schema.password, { message: 'A senha é obrigatória.' });
        minLength(schema.password, 6, { message: 'A senha deve ter ao menos 6 caracteres.' });
        maxLength(schema.password, 20, { message: 'A senha deve ter no máximo 20 caracteres.' });
    });

    readonly canSubmitAccount = computed(() => this.accountForm().valid() && !this.accountMutating());

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

        effect(() => {
            const dialog = this.deleteDialogRef()?.nativeElement;
            if (dialog && !dialog.open) {
                dialog.showModal();
            }
        });

        effect(() => {
            const dialog = this.removeAccountDialogRef()?.nativeElement;
            if (dialog && !dialog.open) {
                dialog.showModal();
            }
        });
    }

    ngOnDestroy(): void {
        this.store.dispatch(PatientActions.clearSelectedPatient());
    }

    onCpfInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, cpf: formatCpf(rawValue) }));
    }

    onBirthDateInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, birthDate: rawValue }));
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

    toggleShowAccountPassword(): void {
        this.showAccountPassword.update((show) => !show);
    }

    generateAccountPassword(): void {
        const password = generateRandomSecret();
        this.accountModel.update((current) => ({ ...current, password }));
        this.showAccountPassword.set(true);
        this.accountForm.password().markAsTouched();
    }

    onSubmitAccount(event: Event): void {
        event.preventDefault();

        if (!this.canSubmitAccount()) {
            this.accountForm().markAsTouched();
            return;
        }

        const value = this.accountModel();

        this.store.dispatch(
            PatientActions.createPatientAccount({
                patientId: this.patientId(),
                payload: {
                    email: value.email,
                    password: value.password,
                },
            }),
        );

        this.accountModel.set({ email: '', password: '' });
    }

    openRemoveAccountConfirm(): void {
        this.showRemoveAccountConfirm.set(true);
    }

    requestCloseRemoveAccountConfirm(): void {
        this.removeAccountDialogRef()?.nativeElement.close();
    }

    onRemoveAccountDialogClosed(): void {
        this.showRemoveAccountConfirm.set(false);
    }

    confirmRemoveAccount(): void {
        this.store.dispatch(PatientActions.removePatientAccount({ patientId: this.patientId() }));
        this.requestCloseRemoveAccountConfirm();
    }

    openDeleteConfirm(): void {
        this.showDeleteConfirm.set(true);
    }

    requestCloseDeleteConfirm(): void {
        this.deleteDialogRef()?.nativeElement.close();
    }

    onDeleteDialogClosed(): void {
        this.showDeleteConfirm.set(false);
    }

    confirmDelete(): void {
        this.store.dispatch(PatientActions.deletePatient({ id: this.patientId() }));
        this.requestCloseDeleteConfirm();
    }

    goBack(): void {
        this.router.navigate(['/patients']);
    }
}
