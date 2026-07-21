import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { PasswordField } from '@shared/ui/password-field/password-field';
import * as AuthActions from '@features/auth/store/auth.actions';
import { selectResetPasswordLoading } from '@features/auth/store/auth.selectors';

@Component({
    selector: 'app-reset-password-form',
    imports: [PasswordField],
    templateUrl: './reset-password-form.html',
    styleUrl: './reset-password-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordForm {
    private readonly store = inject(Store);

    readonly token = input.required<string>();

    readonly loading = this.store.selectSignal(selectResetPasswordLoading);

    readonly model = signal({
        newPassword: '',
        confirmPassword: '',
    });

    readonly resetForm = form(this.model, (schema) => {
        required(schema.newPassword, { message: 'A senha é obrigatória.' });
        minLength(schema.newPassword, 6, { message: 'A senha deve ter ao menos 6 caracteres.' });
        maxLength(schema.newPassword, 20, { message: 'A senha deve ter no máximo 20 caracteres.' });

        required(schema.confirmPassword, { message: 'A confirmação de senha é obrigatória.' });
        validate(schema.confirmPassword, ({ value, valueOf }) =>
            value() === valueOf(schema.newPassword) ? null : { kind: 'mismatch', message: 'As senhas não coincidem.' },
        );
    });

    readonly canSubmit = computed(() => this.resetForm().valid() && !this.loading() && !!this.token());

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.resetForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            AuthActions.resetPassword({
                token: this.token(),
                newPassword: value.newPassword,
                confirmPassword: value.confirmPassword,
            }),
        );
    }
}
