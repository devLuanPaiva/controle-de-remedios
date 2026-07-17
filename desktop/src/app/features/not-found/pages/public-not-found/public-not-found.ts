import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthCard } from '@features/auth/components/auth-card/auth-card';
import { NotFound } from '@shared/ui/not-found/not-found';

@Component({
    selector: 'app-public-not-found',
    imports: [AuthCard, NotFound],
    templateUrl: './public-not-found.html',
    styleUrl: './public-not-found.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicNotFound {
    private readonly router = inject(Router);

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}
