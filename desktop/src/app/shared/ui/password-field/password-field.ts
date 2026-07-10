import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { Field } from '@shared/ui/field/field';
import { generateRandomPassword } from '@shared/utils/password.util';

@Component({
    selector: 'app-password-field',
    imports: [FormField, Field],
    templateUrl: './password-field.html',
    styleUrl: './password-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordField {
    readonly id = input.required<string>();
    readonly label = input('Senha');
    readonly autocomplete = input('new-password');
    readonly field = input.required<FieldTree<string>>();

    readonly showPassword = signal(false);

    toggleShowPassword(): void {
        this.showPassword.update((show) => !show);
    }

    generatePassword(): void {
        const state = this.field()();
        state.value.set(generateRandomPassword());
        state.markAsTouched();
        this.showPassword.set(true);
    }
}
