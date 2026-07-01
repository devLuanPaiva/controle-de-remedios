import { inject, Injectable } from "@angular/core";
import * as AuthActions from './auth.actions';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { ToastService } from "@core/ui/toast/service/toast.service";
import { catchError, exhaustMap, map, of, tap } from "rxjs";
import { ToastType } from "@core/ui/toast/models/toast.model";
import { AuthSessionService } from "../services/auth-session.service";

@Injectable()
export class AuthEffects {
    private readonly actions$ = inject(Actions);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly session = inject(AuthSessionService)

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),

            exhaustMap(action => this.authService.login({
                email: action.email,
                password: action.password

            }).pipe(
                map(response => {
                    this.session.setSession(response.user, response.accessToken, response.refreshToken);
                    return AuthActions.loginSuccess({ user: response.user })
                }),
                catchError(error =>
                    of(
                        AuthActions.loginFailure({
                            message: error.error?.message || "Erro ao fazer login."
                        })
                    )
                )
            )
            )
        )
    )

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(() => {
                this.toast.show(ToastType.Success, "Login realizado com sucesso!");
                this.router.navigate(['/dashboard']);
            })
        ),
        { dispatch: false }
    )

    loginFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginFailure),
            tap(action => {
                this.toast.show(ToastType.Error, action.message);
            })
        ),
        { dispatch: false }

    )

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                this.session.logout();
                this.toast.show(ToastType.Info, "Logout realizado com sucesso!");
            })
        ),
        { dispatch: false }
    )
}