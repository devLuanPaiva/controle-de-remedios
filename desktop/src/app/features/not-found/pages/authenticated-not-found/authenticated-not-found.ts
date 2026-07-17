import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NotFound } from '@shared/ui/not-found/not-found';

@Component({
    selector: 'app-authenticated-not-found',
    imports: [NotFound],
    templateUrl: './authenticated-not-found.html',
    styleUrl: './authenticated-not-found.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedNotFound {
    private readonly router = inject(Router);

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
