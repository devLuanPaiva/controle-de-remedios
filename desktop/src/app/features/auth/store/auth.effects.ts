import { inject, Injectable } from "@angular/core";
import * as AuthActions from './auth.actions';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../services/auth.service";
import { GoogleAuthService, GoogleSignInCancelledError } from "../services/google-auth.service";
import { Router } from "@angular/router";
import { ToastService } from "@core/ui/toast/service/toast.service";
import { catchError, exhaustMap, map, of, tap } from "rxjs";
import { ToastType } from "@core/ui/toast/models/toast.model";
import { AuthSessionService } from "../services/auth-session.service";
import { extractErrorMessage, extractErrors } from "@shared/utils/api-error.util";

@Injectable()
export class AuthEffects {
    private readonly actions$ = inject(Actions);
    private readonly authService = inject(AuthService);
    private readonly googleAuthService = inject(GoogleAuthService);
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
                            message: extractErrorMessage(error, "Erro ao fazer login.")
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

    loginWithGoogle$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginWithGoogle),

            exhaustMap(() => this.googleAuthService.login().pipe(
                map(response => AuthActions.loginSuccess({ user: response.user })),
                catchError(error => {
                    if (error instanceof GoogleSignInCancelledError) {
                        return of(AuthActions.loginWithGoogleCancelled());
                    }

                    return of(
                        AuthActions.loginFailure({
                            message: extractErrorMessage(error, "Erro ao entrar com o Google.")
                        })
                    );
                })
            )
            )
        )
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

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPassword),

            exhaustMap(action => this.authService.resetPassword({
                token: action.token,
                newPassword: action.newPassword,
                confirmPassword: action.confirmPassword

            }).pipe(
                map(() => AuthActions.resetPasswordSuccess()),
                catchError(error =>
                    of(
                        AuthActions.resetPasswordFailure({
                            message: extractErrorMessage(error, "Erro ao redefinir a senha."),
                            errors: extractErrors(error)
                        })
                    )
                )
            )
            )
        )
    )

    resetPasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordSuccess),
            tap(() => {
                this.toast.show(ToastType.Success, "Senha redefinida com sucesso! Faça login com sua nova senha.");
                this.router.navigate(['/login']);
            })
        ),
        { dispatch: false }
    )

    resetPasswordFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordFailure),
            tap(action => {
                this.toast.show(ToastType.Error, action.message);
            })
        ),
        { dispatch: false }
    )
}