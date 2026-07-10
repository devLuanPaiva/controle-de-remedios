import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { Pagination } from '@shared/ui/pagination/pagination';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

import { UserCreateModal } from '../../components/user-create-modal/user-create-modal';
import * as UsersActions from '../../store/user.actions';
import { UserFilterParams } from '../../models/user-api.model';
import { getManageableRoles, normalizeUserRole, UserRole, UserRoleLabels } from '../../models/user.model';
import {
    selectAllUsers,
    selectUsersError,
    selectUsersLoading,
    selectUsersPagination,
} from '../../store/user.selectors';

interface UserListFilterForm {
    role: UserRole | '';
    name: string;
    email: string;
    cpf: string;
    active: '' | 'true' | 'false';
}

const EMPTY_FILTER_FORM: UserListFilterForm = {
    role: '',
    name: '',
    email: '',
    cpf: '',
    active: '',
};

@Component({
    selector: 'app-user-list',
    imports: [RouterLink, Avatar, RoleBadge, UserCreateModal, Pagination],
    templateUrl: './user-list.html',
    styleUrl: './user-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);

    readonly formatCpf = formatCpf;
    readonly UserRoleLabels = UserRoleLabels;

    readonly users = this.store.selectSignal(selectAllUsers);
    readonly loading = this.store.selectSignal(selectUsersLoading);
    readonly error = this.store.selectSignal(selectUsersError);
    readonly pagination = this.store.selectSignal(selectUsersPagination);
    readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly userRole = computed(() => normalizeUserRole(this.session.user()?.role));
    readonly manageableRoles = computed(() => getManageableRoles(this.userRole()));

    readonly showCreateModal = signal(false);
    readonly filterForm = signal<UserListFilterForm>({ ...EMPTY_FILTER_FORM });

    private readonly requestedPage = signal(0);

    ngOnInit(): void {
        this.loadPage(0);
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    onFilterRoleChange(rawValue: string): void {
        const role = rawValue === '' ? '' : (Number(rawValue) as UserRole);
        this.filterForm.update((current) => ({ ...current, role }));
    }

    onFilterNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, name: value }));
    }

    onFilterEmailChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, email: value }));
    }

    onFilterCpfChange(rawValue: string): void {
        this.filterForm.update((current) => ({ ...current, cpf: formatCpf(rawValue) }));
    }

    onFilterActiveChange(rawValue: string): void {
        this.filterForm.update((current) => ({ ...current, active: rawValue as UserListFilterForm['active'] }));
    }

    applyFilters(event: Event): void {
        event.preventDefault();
        this.loadPage(0);
    }

    clearFilters(): void {
        this.filterForm.set({ ...EMPTY_FILTER_FORM });
        this.loadPage(0);
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
        this.store.dispatch(UsersActions.loadUsers({ page, filter: this.buildFilter() }));
    }

    private buildFilter(): UserFilterParams {
        const form = this.filterForm();
        const isManager = this.userRole() === UserRole.MANAGER;

        return {
            role: form.role === '' ? undefined : form.role,
            name: form.name || undefined,
            email: form.email || undefined,
            cpf: form.cpf ? onlyDigits(form.cpf) : undefined,
            active: form.active === '' ? undefined : form.active === 'true',
            companyId: isManager ? (this.connectedCompanyId() ?? undefined) : undefined,
        };
    }
}
