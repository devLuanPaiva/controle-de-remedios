import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { Field } from '@shared/ui/field/field';
import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { PasswordField } from '@shared/ui/password-field/password-field';
import { Modal } from '@shared/ui/modal/modal';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

import * as UsersActions from '../../store/user.actions';
import { selectUsersMutating } from '../../store/user.selectors';
import { UserRole, UserRoleLabels } from '../../models/user.model';

@Component({
    selector: 'app-user-create-modal',
    imports: [FormField, Field, CpfField, PasswordField, Modal],
    templateUrl: './user-create-modal.html',
    styleUrl: './user-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateModal {
    private readonly store = inject(Store);

    readonly allowedRoles = input.required<UserRole[]>();
    readonly closed = output<void>();

    readonly UserRoleLabels = UserRoleLabels;

    readonly mutating = this.store.selectSignal(selectUsersMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);

    readonly model = signal({
        name: '',
        email: '',
        cpf: '',
        role: null as UserRole | null,
        password: '',
        imageUrl: '',
    });

    readonly userForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        minLength(schema.name, 3, { message: 'O nome deve ter ao menos 3 caracteres.' });

        required(schema.email, { message: 'O email é obrigatório.' });
        email(schema.email, { message: 'O email deve ser válido.' });

        required(schema.cpf, { message: 'O CPF é obrigatório.' });
        validate(schema.cpf, ({ value }) => (isValidCpf(value()) ? null : { kind: 'cpf', message: 'CPF inválido.' }));

        required(schema.role, { message: 'Selecione um perfil.' });

        required(schema.password, { message: 'A senha é obrigatória.' });
        minLength(schema.password, 6, { message: 'A senha deve ter ao menos 6 caracteres.' });
        maxLength(schema.password, 20, { message: 'A senha deve ter no máximo 20 caracteres.' });
    });

    readonly canSubmit = computed(() => this.userForm().valid() && !this.mutating());

    roleLabel(role: UserRole): string {
        return UserRoleLabels[role];
    }

    onRoleChange(rawValue: string): void {
        const role = rawValue === '' ? null : Number(rawValue);
        this.model.update((current) => ({ ...current, role }));
    }

    onSubmit(event: Event, modal: Modal): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.userForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            UsersActions.createUser({
                payload: {
                    name: value.name,
                    email: value.email,
                    cpf: onlyDigits(value.cpf),
                    role: value.role!,
                    password: value.password,
                    imageUrl: value.imageUrl || undefined,
                    companyId: this.connectedCompany()?.id,
                },
            }),
        );

        modal.requestClose();
    }
}
