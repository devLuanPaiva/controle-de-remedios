import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import * as AuthActions from '@features/auth/store/auth.actions';

import { form, FormField, required, email } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { selectAuthLoading } from '@features/auth/store/auth.selectors';


@Component({
    selector: 'app-login-form',
    imports: [ReactiveFormsModule, FormField],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
})
export class LoginForm {
    private readonly store = inject(Store);

    submitError = signal<string | null>(null);
    submitSuccess = signal(false);
    submitDisabled = signal(false);

    authModel = signal({
        email: '',
        password: '',
    })

    loading =
        this.store.selectSignal(
            selectAuthLoading
        );

    authForm = form(
        this.authModel,
        (schema) => {
            required(schema.email, {
                message: 'O email é obrigatório.'
            });

            email(schema.email, {
                message: 'O email deve ser válido.'
            })

            required(schema.password, {
                message: 'A senha é obrigatória.'
            });

        }
    )


    canSubmit = computed(() => {
        return this.authForm().valid();
    })

    onSubmit(event: Event) {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.authForm().markAsTouched();
            return;
        }

        this.submitError.set(null);
        this.submitDisabled.set(true);
        this.submitSuccess.set(false);

        this.store.dispatch(
            AuthActions.login({
                email: this.authModel().email,
                password: this.authModel().password

            })
        )
    }
}
