import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, form, minLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { formatCpf, isValidCpf, onlyDigits } from '@shared/utils/cpf.util';
import { diffPrimitive } from '@shared/utils/diff.util';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { Field } from '@shared/ui/field/field';
import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { ImageUploadField } from '@shared/ui/image-upload-field/image-upload-field';
import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';
import { DangerCard } from '@shared/ui/danger-card/danger-card';

import { UpdateUserRequest } from '../../models/user-api.model';
import * as UsersActions from '../../store/user.actions';
import {
    selectSelectedUser,
    selectSelectedUserLoading,
    selectUsersError,
    selectUsersMutating,
} from '../../store/user.selectors';

@Component({
    selector: 'app-user-edit',
    imports: [FormField, Avatar, RoleBadge, Field, CpfField, ImageUploadField, ConfirmDialog, DangerCard],
    templateUrl: './user-edit.html',
    styleUrl: './user-edit.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEdit implements OnDestroy {
    private readonly store = inject(Store);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

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
    }

    ngOnDestroy(): void {
        this.store.dispatch(UsersActions.clearSelectedUser());
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.editForm().markAsTouched();
            return;
        }

        const original = this.user();

        if (!original) {
            return;
        }

        const value = this.model();

        const payload: UpdateUserRequest = {
            name: diffPrimitive(original.name, value.name),
            cpf: diffPrimitive(original.cpf, onlyDigits(value.cpf)),
            imageUrl: diffPrimitive(original.imageUrl ?? '', value.imageUrl) || undefined,
        };

        this.store.dispatch(
            UsersActions.updateUser({
                id: this.userId(),
                payload,
            }),
        );
    }

    onImageUploaded(url: string): void {
        this.model.update((current) => ({ ...current, imageUrl: url }));
    }

    openResetConfirm(): void {
        this.showResetConfirm.set(true);
    }

    onResetConfirmClosed(): void {
        this.showResetConfirm.set(false);
    }

    confirmReset(): void {
        const user = this.user();

        if (user) {
            this.store.dispatch(UsersActions.resetPassword({ email: user.email }));
        }
    }

    goBack(): void {
        this.router.navigate(['/users']);
    }
}
