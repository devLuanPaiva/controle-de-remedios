import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-login-form',
    imports: [ReactiveFormsModule],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
    readonly loading = input(false);
    readonly errorMessage = input<string | null>(null);
    readonly submitted = output<{ email: string; password: string }>();

    private readonly fb = inject(FormBuilder);

    readonly passwordVisible = signal(false);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    get emailControl() {
        return this.form.controls.email;
    }

    get passwordControl() {
        return this.form.controls.password;
    }

    togglePasswordVisibility(): void {
        this.passwordVisible.update(visible => !visible);
    }

    onSubmit(): void {
        if (this.loading()) {
            return;
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitted.emit(this.form.getRawValue());
    }
}
