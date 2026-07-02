import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { AuthCard } from '../../components/auth-card/auth-card';
import { LoginForm } from '../../components/login-form/login-form';
import * as AuthActions from '../../store/auth.actions';
import { selectAuthLoading } from '../../store/auth.selectors';

@Component({
    selector: 'app-login',
    imports: [AuthCard, LoginForm],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly loading = this.store.selectSignal(selectAuthLoading);
    readonly errorMessage = signal<string | null>(null);

    constructor() {
        this.actions$
            .pipe(ofType(AuthActions.loginFailure), takeUntilDestroyed())
            .subscribe(({ message }) => this.errorMessage.set(message));
    }

    onSubmit(credentials: { email: string; password: string }): void {
        this.errorMessage.set(null);
        this.store.dispatch(AuthActions.login(credentials));
    }
}
