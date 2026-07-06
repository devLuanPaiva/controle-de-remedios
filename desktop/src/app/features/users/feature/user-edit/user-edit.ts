import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, form, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';

import * as UsersActions from '../../store/user.actions';
import {
    selectSelectedUser,
    selectSelectedUserLoading,
    selectUsersError,
    selectUsersMutating,
} from '../../store/user.selectors';

@Component({
    selector: 'app-user-edit',
    imports: [FormField, Avatar, RoleBadge],
    templateUrl: './user-edit.html',
    styleUrl: './user-edit.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEdit implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly confirmDialogRef = viewChild<ElementRef<HTMLDialogElement>>('confirmDialog');

    readonly userId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
        { requireSync: true },
    );

    readonly user = this.store.selectSignal(selectSelectedUser);
    readonly loading = this.store.selectSignal(selectSelectedUserLoading);
    readonly error = this.store.selectSignal(selectUsersError);
    readonly mutating = this.store.selectSignal(selectUsersMutating);

    readonly showResetConfirm = signal(false);

    readonly model = signal({
        name: '',
        cpf: '',
        imageUrl: '',
    });

    readonly editForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        minLength(schema.name, 3, { message: 'O nome deve ter ao menos 3 caracteres.' });

        required(schema.cpf, { message: 'O CPF é obrigatório.' });
        validate(schema.cpf, ({ value }) => (isValidCpf(value()) ? null : { kind: 'cpf', message: 'CPF inválido.' }));
    });

    readonly canSubmit = computed(() => this.editForm().valid() && !this.mutating());

    constructor() {
        effect(() => {
            const id = this.userId();
            if (id) {
                this.store.dispatch(UsersActions.loadUser({ id }));
            }
        });

        effect(() => {
            const user = this.user();
            if (user) {
                this.model.set({
                    name: user.name,
                    cpf: formatCpf(user.cpf),
                    imageUrl: user.imageUrl ?? '',
                });
            }
        });

        effect(() => {
            const dialog = this.confirmDialogRef()?.nativeElement;
            if (dialog && !dialog.open) {
                dialog.showModal();
            }
        });
    }

    ngOnDestroy(): void {
        this.store.dispatch(UsersActions.clearSelectedUser());
    }

    onCpfInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, cpf: formatCpf(rawValue) }));
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.editForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            UsersActions.updateUser({
                id: this.userId(),
                payload: {
                    name: value.name,
                    cpf: onlyDigits(value.cpf),
                    imageUrl: value.imageUrl || undefined,
                },
            }),
        );
    }

    openResetConfirm(): void {
        this.showResetConfirm.set(true);
    }

    requestCloseResetConfirm(): void {
        this.confirmDialogRef()?.nativeElement.close();
    }

    onResetConfirmDialogClosed(): void {
        this.showResetConfirm.set(false);
    }

    confirmReset(): void {
        const user = this.user();

        if (user) {
            this.store.dispatch(UsersActions.resetPassword({ email: user.email }));
        }

        this.requestCloseResetConfirm();
    }

    goBack(): void {
        this.router.navigate(['/users']);
    }
}
