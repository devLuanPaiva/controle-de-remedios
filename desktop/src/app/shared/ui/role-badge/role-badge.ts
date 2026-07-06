import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UserRole, UserRoleLabels } from '@features/users/models/user.model';

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'badge-primary',
    [UserRole.MANAGER]: 'badge-warning',
    [UserRole.USER]: 'badge-outline',
};

@Component({
    selector: 'app-role-badge',
    template: `<span class="badge" [class]="badgeClass()">{{ label() }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleBadge {
    readonly role = input.required<UserRole>();

    readonly label = computed(() => UserRoleLabels[this.role()]);
    readonly badgeClass = computed(() => ROLE_BADGE_CLASS[this.role()]);
}
