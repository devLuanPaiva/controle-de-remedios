import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

import * as UsersActions from '../../store/user.actions';
import { selectUsersMutating } from '../../store/user.selectors';
import { UserRole, UserRoleLabels } from '../../models/user.model';

const RANDOM_CHAR_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

function generateRandomSecret(length = 12): string {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    return Array.from(values, (value) => RANDOM_CHAR_POOL[value % RANDOM_CHAR_POOL.length]).join('');
}

@Component({
    selector: 'app-user-create-modal',
    imports: [FormField],
    templateUrl: './user-create-modal.html',

    styleUrl: './user-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateModal {
    private readonly store = inject(Store);

    private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

    readonly allowedRoles = input.required<UserRole[]>();
    readonly closed = output<void>();

    readonly UserRoleLabels = UserRoleLabels;

    readonly mutating = this.store.selectSignal(selectUsersMutating);
    readonly showPassword = signal(false);

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

    constructor() {
        afterNextRender(() => {
            this.dialogRef().nativeElement.showModal();
        });
    }

    roleLabel(role: UserRole): string {
        return UserRoleLabels[role];
    }

    onCpfInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, cpf: formatCpf(rawValue) }));
    }

    onRoleChange(rawValue: string): void {
        const role = rawValue === '' ? null : Number(rawValue);
        this.model.update((current) => ({ ...current, role }));
    }

    toggleShowPassword(): void {
        this.showPassword.update((show) => !show);
    }

    generatePassword(): void {
        const password = generateRandomSecret();
        this.model.update((current) => ({ ...current, password }));
        this.showPassword.set(true);
        this.userForm.password().markAsTouched();
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
                },
            }),
        );

        this.requestClose();
    }
}
