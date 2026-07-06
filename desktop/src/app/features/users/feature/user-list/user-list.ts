import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { formatCpf } from '@shared/utils/cpf.util';

import { UserCreateModal } from '../user-create-modal/user-create-modal';
import * as UsersActions from '../../store/user.actions';
import {
    selectManageableRolesForCurrentUser,
    selectUsersError,
    selectUsersLoading,
    selectUsersPagination,
    selectVisibleUsers,
} from '../../store/user.selectors';

@Component({
    selector: 'app-user-list',
    imports: [RouterLink, Avatar, RoleBadge, UserCreateModal],
    templateUrl: './user-list.html',
    styleUrl: './user-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
    private readonly store = inject(Store);

    readonly formatCpf = formatCpf;

    readonly users = this.store.selectSignal(selectVisibleUsers);
    readonly loading = this.store.selectSignal(selectUsersLoading);
    readonly error = this.store.selectSignal(selectUsersError);
    readonly pagination = this.store.selectSignal(selectUsersPagination);
    readonly manageableRoles = this.store.selectSignal(selectManageableRolesForCurrentUser);

    readonly searchTerm = signal('');
    readonly showCreateModal = signal(false);

    private readonly requestedPage = signal(0);

    readonly filteredUsers = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();

        if (!term) {
            return this.users();
        }

        return this.users().filter((user) =>
            [user.name, user.email, user.cpf].some((field) => field.toLowerCase().includes(term)),
        );
    });

    ngOnInit(): void {
        this.loadPage(0);
    }

    onSearchTermChange(value: string): void {
        this.searchTerm.set(value);
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    retry(): void {
        this.loadPage(this.requestedPage());
    }

    goToPreviousPage(): void {
        if (this.pagination().previous) {
            this.loadPage(this.requestedPage() - 1);
        }
    }

    goToNextPage(): void {
        if (this.pagination().next) {
            this.loadPage(this.requestedPage() + 1);
        }
    }

    private loadPage(page: number): void {
        this.requestedPage.set(page);
        this.store.dispatch(UsersActions.loadUsers({ page }));
    }
}
