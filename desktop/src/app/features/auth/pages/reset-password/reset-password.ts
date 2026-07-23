import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { AuthCard } from '../../components/auth-card/auth-card';
import { ResetPasswordForm } from '../../components/reset-password-form/reset-password-form';

@Component({
    selector: 'app-reset-password',
    imports: [AuthCard, ResetPasswordForm],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
    private readonly route = inject(ActivatedRoute);

    readonly token = toSignal(
        this.route.queryParamMap.pipe(map((params) => params.get('token') ?? '')),
        { initialValue: this.route.snapshot.queryParamMap.get('token') ?? '' },
    );
}
