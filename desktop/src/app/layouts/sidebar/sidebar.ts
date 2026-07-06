import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AuthActions from '@features/auth/store/auth.actions';
import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { normalizeUserRole, UserRole } from '@features/users/models/user.model';
import { HasRoleDirective } from '@shared/directives/has-role.directive';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, NgOptimizedImage, HasRoleDirective, Avatar, RoleBadge],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
    private readonly store = inject(Store);
    private readonly session = inject(AuthSessionService);

    readonly navigated = output<void>();

    readonly UserRole = UserRole;

    readonly user = this.session.user;
    readonly userRole = computed(() => normalizeUserRole(this.user()?.role));

    onLogout(): void {
        this.store.dispatch(AuthActions.logout());
    }
}
