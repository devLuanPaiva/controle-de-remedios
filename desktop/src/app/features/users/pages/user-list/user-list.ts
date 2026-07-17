import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { Avatar } from '@shared/ui/avatar/avatar';
import { NotFound } from '@shared/ui/not-found/not-found';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';
import { Pagination } from '@shared/ui/pagination/pagination';
import { Tabs, TabConfig } from '@shared/ui/tabs/tabs';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';

import { UserCreateForm } from '../../components/user-create-form/user-create-form';
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
    imports: [RouterLink, Avatar, RoleBadge, Tabs, UserCreateForm, Pagination, NotFound],
    templateUrl: './user-list.html',
    styleUrl: './user-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);
    private readonly actions$ = inject(Actions);

    readonly formatCpf = formatCpf;
    readonly UserRoleLabels = UserRoleLabels;

    readonly users = this.store.selectSignal(selectAllUsers);
    readonly loading = this.store.selectSignal(selectUsersLoading);
    readonly error = this.store.selectSignal(selectUsersError);
    readonly pagination = this.store.selectSignal(selectUsersPagination);
    readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    readonly userRole = computed(() => normalizeUserRole(this.session.user()?.role));
    readonly manageableRoles = computed(() => getManageableRoles(this.userRole()));

    readonly tabs: TabConfig[] = [
        { id: 'list', label: 'Listagem' },
        { id: 'create', label: 'Cadastrar novo' },
    ];
    readonly activeTabId = signal('list');

    readonly filterForm = signal<UserListFilterForm>({ ...EMPTY_FILTER_FORM });

    readonly hasActiveFilters = computed(() => {
        const form = this.filterForm();
        return !!(form.role || form.name || form.email || form.cpf || form.active);
    });

    readonly showNotFound = computed(
        () => !this.loading() && !this.error() && this.pagination().count === 0 && !this.hasActiveFilters(),
    );

    private readonly requestedPage = signal(0);

    constructor() {
        this.actions$.pipe(ofType(UsersActions.createUserSuccess), takeUntilDestroyed()).subscribe(() => {
            this.activeTabId.set('list');
            this.loadPage(0);
        });
    }

    ngOnInit(): void {
        this.loadPage(0);
    }

    onTabChange(tabId: string): void {
        this.activeTabId.set(tabId);
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
