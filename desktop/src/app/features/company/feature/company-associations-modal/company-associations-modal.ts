import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { getManageableRoles, normalizeUserRole, UserRole } from '@features/users/models/user.model';
import * as UsersActions from '@features/users/store/user.actions';
import { selectAllUsers } from '@features/users/store/user.selectors';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';

import * as CompanyActions from '../../store/company.actions';
import {
    selectAssociatedUsers,
    selectAssociatedUsersLoading,
    selectAssociatedUsersMutating,
} from '../../store/company.selectors';

@Component({
    selector: 'app-company-associations-modal',
    imports: [Avatar, RoleBadge],
    templateUrl: './company-associations-modal.html',
    styleUrl: './company-associations-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyAssociationsModal {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);

    private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

    readonly companyId = input.required<string>();
    readonly closed = output<void>();

    readonly associatedUsers = this.store.selectSignal(selectAssociatedUsers);
    readonly associatedUsersLoading = this.store.selectSignal(selectAssociatedUsersLoading);
    readonly associatedUsersMutating = this.store.selectSignal(selectAssociatedUsersMutating);
    readonly allUsers = this.store.selectSignal(selectAllUsers);

    readonly manageableRoles = computed(() => getManageableRoles(normalizeUserRole(this.session.user()?.role)));

    readonly searchTerm = signal('');
    readonly selectedCandidateId = signal('');

    readonly candidateUsers = computed(() => {
        const associatedIds = new Set(this.associatedUsers().map((user) => user.id));
        const roles = this.manageableRoles();

        return this.allUsers().filter((user) => roles.includes(user.role) && !associatedIds.has(user.id));
    });

    readonly filteredAssociatedUsers = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();

        if (!term) {
            return this.associatedUsers();
        }

        return this.associatedUsers().filter((user) =>
            [user.name, user.email].some((field) => field.toLowerCase().includes(term)),
        );
    });

    constructor() {
        afterNextRender(() => {
            this.store.dispatch(CompanyActions.loadCompanyUsers({ companyId: this.companyId() }));
            this.store.dispatch(UsersActions.loadUsers({ page: 0 }));

            this.dialogRef().nativeElement.showModal();
        });
    }

    canRemove(role: UserRole): boolean {
        return this.manageableRoles().includes(role);
    }

    onSearchTermChange(value: string): void {
        this.searchTerm.set(value);
    }

    onCandidateChange(userId: string): void {
        this.selectedCandidateId.set(userId);
    }

    associateSelectedUser(): void {
        const userId = this.selectedCandidateId();

        if (!userId) {
            return;
        }

        this.store.dispatch(CompanyActions.associateUser({ companyId: this.companyId(), userId }));
        this.selectedCandidateId.set('');
    }

    removeUser(userId: string): void {
        this.store.dispatch(CompanyActions.removeUser({ companyId: this.companyId(), userId }));
    }

    requestClose(): void {
        this.dialogRef().nativeElement.close();
    }

    onDialogClick(event: MouseEvent): void {
        if (event.target === this.dialogRef().nativeElement) {
            this.requestClose();
        }
    }

    onDialogClosed(): void {
        this.store.dispatch(CompanyActions.clearAssociatedUsers());
        this.closed.emit();
    }
}
