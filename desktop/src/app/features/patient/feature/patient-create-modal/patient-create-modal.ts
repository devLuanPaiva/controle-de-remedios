import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, output, signal, viewChild } from '@angular/core';
import { FormField, applyWhen, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { TabConfig, Tabs } from '@shared/ui/tabs/tabs';
import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

import { UserRole } from '../../../users/models/user.model';
import * as PatientActions from '../../store/patient.actions';
import { selectPatientsMutating } from '../../store/patient.selectors';

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

@Component({
    selector: 'app-patient-create-modal',
    imports: [FormField, Tabs, RoleBadge],
    templateUrl: './patient-create-modal.html',
    styleUrl: './patient-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientCreateModal {
    private readonly store = inject(Store);

    private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

    readonly closed = output<void>();

    readonly PatientRole = UserRole.PATIENT;
    readonly maxBirthDate = new Date().toISOString().slice(0, 10);

    readonly tabs: TabConfig[] = [
        { id: 'no-account', label: 'Sem conta' },
        { id: 'with-account', label: 'Com conta' },
    ];

    readonly mutating = this.store.selectSignal(selectPatientsMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);
    readonly showPassword = signal(false);

    readonly model = signal({
        name: '',
        cpf: '',
        birthDate: '',
        withAccount: false,
        email: '',
        password: '',
    });

    readonly activeTabId = computed(() => (this.model().withAccount ? 'with-account' : 'no-account'));

    readonly patientForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        minLength(schema.name, 3, { message: 'O nome deve ter ao menos 3 caracteres.' });

        required(schema.cpf, { message: 'O CPF é obrigatório.' });
        validate(schema.cpf, ({ value }) => (isValidCpf(value()) ? null : { kind: 'cpf', message: 'CPF inválido.' }));

        required(schema.birthDate, { message: 'A data de nascimento é obrigatória.' });
        validate(schema.birthDate, ({ value }) =>
            isNotFutureDate(value()) ? null : { kind: 'birthDate', message: 'A data de nascimento não pode ser futura.' },
        );

        applyWhen(
            schema,
            (ctx) => ctx.value().withAccount,
            (conditional) => {
                required(conditional.email, { message: 'O e-mail é obrigatório.' });
                email(conditional.email, { message: 'O e-mail deve ser válido.' });

                required(conditional.password, { message: 'A senha é obrigatória.' });
                minLength(conditional.password, 6, { message: 'A senha deve ter ao menos 6 caracteres.' });
                maxLength(conditional.password, 20, { message: 'A senha deve ter no máximo 20 caracteres.' });
            },
        );
    });

    readonly canSubmit = computed(() => this.patientForm().valid() && !this.mutating() && !!this.connectedCompany());

    constructor() {
        afterNextRender(() => {
            this.dialogRef().nativeElement.showModal();
        });
    }

    onTabChange(tabId: string): void {
        this.model.update((current) => ({ ...current, withAccount: tabId === 'with-account' }));
    }

    onCpfInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, cpf: formatCpf(rawValue) }));
    }

    onBirthDateInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, birthDate: rawValue }));
    }

    toggleShowPassword(): void {
        this.showPassword.update((show) => !show);
    }

    generatePassword(): void {
        const password = generateRandomSecret();
        this.model.update((current) => ({ ...current, password }));
        this.showPassword.set(true);
        this.patientForm.password().markAsTouched();
    }

    requestClose(): void {
        this.dialogRef().nativeElement.close();
    }

    onDialogClick(event: MouseEvent): void {
        if (event.target === this.dialogRef().nativeElement) {
            this.requestClose();
        }
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        const companyId = this.connectedCompany()?.id;

        if (!this.canSubmit() || !companyId) {
            this.patientForm().markAsTouched();
            return;
        }

        const value = this.model();

        if (value.withAccount) {
            this.store.dispatch(
                PatientActions.createPatientWithAccount({
                    payload: {
                        name: value.name,
                        cpf: onlyDigits(value.cpf),
                        birthDate: value.birthDate,
                        companyId,
                        email: value.email,
                        password: value.password,
                    },
                }),
            );
        } else {
            this.store.dispatch(
                PatientActions.createPatient({
                    payload: {
                        name: value.name,
                        cpf: onlyDigits(value.cpf),
                        birthDate: value.birthDate,
                        companyId,
                    },
                }),
            );
        }

        this.requestClose();
    }
}
