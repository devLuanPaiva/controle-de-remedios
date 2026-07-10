import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { UserRole } from '@features/users/models/user.model';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { Field } from '@shared/ui/field/field';
import { PasswordField } from '@shared/ui/password-field/password-field';
import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';

import * as PatientActions from '../../store/patient.actions';
import { selectPatientAccountMutating } from '../../store/patient.selectors';

@Component({
    selector: 'app-patient-account-panel',
    imports: [FormField, RoleBadge, Field, PasswordField, ConfirmDialog],
    templateUrl: './patient-account-panel.html',
    styleUrl: './patient-account-panel.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientAccountPanel {
    private readonly store = inject(Store);

    readonly patientId = input.required<string>();
    readonly hasAccount = input.required<boolean>();

    readonly PatientRole = UserRole.PATIENT;

    readonly mutating = this.store.selectSignal(selectPatientAccountMutating);

    readonly showRemoveConfirm = signal(false);

    readonly model = signal({
        email: '',
        password: '',
    });

    readonly accountForm = form(this.model, (schema) => {
        required(schema.email, { message: 'O e-mail é obrigatório.' });
        email(schema.email, { message: 'O e-mail deve ser válido.' });

        required(schema.password, { message: 'A senha é obrigatória.' });
        minLength(schema.password, 6, { message: 'A senha deve ter ao menos 6 caracteres.' });
        maxLength(schema.password, 20, { message: 'A senha deve ter no máximo 20 caracteres.' });
    });

    readonly canSubmit = computed(() => this.accountForm().valid() && !this.mutating());

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.accountForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            PatientActions.createPatientAccount({
                patientId: this.patientId(),
                payload: {
                    email: value.email,
                    password: value.password,
                },
            }),
        );

        this.model.set({ email: '', password: '' });
    }

    openRemoveConfirm(): void {
        this.showRemoveConfirm.set(true);
    }

    onRemoveConfirmClosed(): void {
        this.showRemoveConfirm.set(false);
    }

    confirmRemove(): void {
        this.store.dispatch(PatientActions.removePatientAccount({ patientId: this.patientId() }));
    }
}
