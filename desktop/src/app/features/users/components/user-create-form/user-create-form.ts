import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { selectSelectedCompany } from '@features/company/store/company.selectors';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { ToastType } from '@core/ui/toast/models/toast.model';
import { Field } from '@shared/ui/field/field';
import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { PasswordField } from '@shared/ui/password-field/password-field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { FileUploadService } from '@shared/services/file-upload.service';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

import * as UsersActions from '../../store/user.actions';
import { selectUsersMutating } from '../../store/user.selectors';
import { UserRole, UserRoleLabels } from '../../models/user.model';

@Component({
    selector: 'app-user-create-form',
    imports: [FormField, Field, CpfField, PasswordField, ImageUploadField],
    templateUrl: './user-create-form.html',
    styleUrl: './user-create-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateForm {
    private readonly store = inject(Store);
    private readonly fileUploadService = inject(FileUploadService);
    private readonly toastService = inject(ToastService);

    readonly allowedRoles = input.required<UserRole[]>();

    readonly UserRoleLabels = UserRoleLabels;

    readonly mutating = this.store.selectSignal(selectUsersMutating);
    readonly connectedCompany = this.store.selectSignal(selectSelectedCompany);

    readonly submitting = signal(false);

    readonly model = signal({
        name: '',
        email: '',
        cpf: '',
        role: null as UserRole | null,
        password: '',
        imageFile: null as File | null,
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

    readonly canSubmit = computed(() => this.userForm().valid() && !this.mutating() && !this.submitting());

    roleLabel(role: UserRole): string {
        return UserRoleLabels[role];
    }

    onRoleChange(rawValue: string): void {
        const role = rawValue === '' ? null : Number(rawValue);
        this.model.update((current) => ({ ...current, role }));
    }

    onImageSelected(file: File): void {
        this.model.update((current) => ({ ...current, imageFile: file }));
    }

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.userForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.submitting.set(true);

        try {
            const imageUrl = value.imageFile
                ? await this.fileUploadService.uploadImage(value.imageFile, 'PROFILE', value.name)
                : undefined;

            this.store.dispatch(
                UsersActions.createUser({
                    payload: {
                        name: value.name,
                        email: value.email,
                        cpf: onlyDigits(value.cpf),
                        role: value.role!,
                        password: value.password,
                        imageUrl,
                        companyId: this.connectedCompany()?.id,
                    },
                }),
            );
        } catch {
            this.toastService.show(ToastType.Error, 'Não foi possível enviar a imagem. Tente novamente.');
        } finally {
            this.submitting.set(false);
        }
    }
}
