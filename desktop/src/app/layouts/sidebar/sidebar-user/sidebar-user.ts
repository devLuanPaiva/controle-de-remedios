import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserRole } from '@features/users/models/user.model';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';

@Component({
    selector: 'app-sidebar-user',
    imports: [Avatar, RoleBadge],
    template: `
        <app-avatar [name]="name()" [imageUrl]="imageUrl()" size="md" />

        <div class="sidebar-user__info">
            <span class="sidebar-user__name">{{ name() }}</span>

            @if (role(); as r) {
                <app-role-badge [role]="r" />
            }
        </div>

        <button type="button" class="sidebar-user__logout" (click)="logout.emit()" aria-label="Sair">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        </button>
    `,
    styleUrl: './sidebar-user.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarUser {
    readonly name = input.required<string>();
    readonly imageUrl = input<string | null | undefined>(null);
    readonly role = input<UserRole | null | undefined>(null);

    readonly logout = output<void>();
}
