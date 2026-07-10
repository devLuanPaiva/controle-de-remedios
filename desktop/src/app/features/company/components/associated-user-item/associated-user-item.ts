import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IUser } from '@features/users/models/user.model';
import { Avatar } from '@shared/ui/avatar/avatar';
import { RoleBadge } from '@shared/ui/role-badge/role-badge';

@Component({
    selector: 'li[app-associated-user-item]',
    imports: [Avatar, RoleBadge],
    templateUrl: './associated-user-item.html',
    styleUrl: './associated-user-item.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'associated-user-item',
    },
})
export class AssociatedUserItem {
    readonly user = input.required<IUser>();
    readonly canRemove = input(false);
    readonly removing = input(false);

    readonly remove = output<void>();
}
