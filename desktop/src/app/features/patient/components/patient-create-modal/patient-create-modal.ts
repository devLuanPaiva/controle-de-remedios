import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, applyWhen, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { TabConfig, Tabs } from '@shared/ui/tabs/tabs';
import { Field } from '@shared/ui/field/field';
import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { DateField } from '@shared/ui/date-field/date-field';
import { PasswordField } from '@shared/ui/password-field/password-field';
import { Modal } from '@shared/ui/modal/modal';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf.util';
import { isNotFutureDate, toDateInputValue } from '@shared/utils/date.util';

import { UserRole } from '../../../users/models/user.model';
import * as PatientActions from '../../store/patient.actions';
import { selectPatientsMutating } from '../../store/patient.selectors';

@Component({
    selector: 'app-patient-create-modal',
    imports: [FormField, Tabs, RoleBadge, Field, CpfField, DateField, PasswordField, Modal],
    templateUrl: './patient-create-modal.html',
    styleUrl: './patient-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientCreateModal {
    private readonly store = inject(Store);

    readonly closed = output<void>();

    readonly PatientRole = UserRole.PATIENT;
    readonly maxBirthDate = toDateInputValue(new Date());

    readonly tabs: TabConfig[] = [
        { id: 'no-account', label: 'Sem conta' },
        { id: 'with-account', label: 'Com conta' },
    ];

    readonly mutating = this.store.selectSignal(selectPatientsMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);

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
            isNotFutureDate(value(), new Date()) ? null : { kind: 'birthDate', message: 'A data de nascimento não pode ser futura.' },
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

    onTabChange(tabId: string): void {
        this.model.update((current) => ({ ...current, withAccount: tabId === 'with-account' }));
    }

    onSubmit(event: Event, modal: Modal): void {
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

        modal.requestClose();
    }
}
