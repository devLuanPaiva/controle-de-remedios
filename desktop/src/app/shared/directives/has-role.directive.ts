import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { normalizeUserRole, UserRole } from '@features/users/models/user.model';

@Directive({
    selector: '[hasRole]',
})
export class HasRoleDirective {
    private readonly session = inject(AuthSessionService);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);

    private hasView = false;

    @Input() set hasRole(allowedRoles: UserRole[]) {
        const currentRole = normalizeUserRole(this.session.user()?.role);
        const shouldShow = currentRole !== null && allowedRoles.includes(currentRole);

        if (shouldShow && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!shouldShow && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
