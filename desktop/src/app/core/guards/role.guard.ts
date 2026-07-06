import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '@features/auth/services/auth-session.service';
import { normalizeUserRole, UserRole } from '@features/users/models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const router = inject(Router);
  const session = inject(AuthSessionService);

  const role = normalizeUserRole(session.user()?.role);

  if (role !== null && allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
