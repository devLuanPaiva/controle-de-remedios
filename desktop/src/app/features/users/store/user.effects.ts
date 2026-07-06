import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';

import { UserService } from '../services/user.service';
import * as UsersActions from './user.actions';

function errorMessage(error: HttpErrorResponse, fallback: string): string {
    return error.error?.message || fallback;
}

@Injectable()
export class UsersEffects {
    private readonly actions$ = inject(Actions);
    private readonly userService = inject(UserService);
    private readonly toast = inject(ToastService);

    loadUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.loadUsers),
            switchMap((action) =>
                this.userService.getUsers(action.page).pipe(
                    map((page) =>
                        UsersActions.loadUsersSuccess({
                            users: page.users,
                            count: page.count,
                            currentPage: page.currentPage,
                            totalPages: page.totalPages,
                            next: page.next,
                            previous: page.previous,
                        }),
                    ),
                    catchError((error) =>
                        of(UsersActions.loadUsersFailure({ message: errorMessage(error, 'Erro ao carregar usuários.') })),
                    ),
                ),
            ),
        ),
    );

    loadUsersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.loadUsersFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.loadUser),
            switchMap((action) =>
                this.userService.getUserById(action.id).pipe(
                    map((user) => UsersActions.loadUserSuccess({ user })),
                    catchError((error) =>
                        of(UsersActions.loadUserFailure({ message: errorMessage(error, 'Erro ao carregar usuário.') })),
                    ),
                ),
            ),
        ),
    );

    loadUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.loadUserFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.createUser),
            exhaustMap((action) =>
                this.userService.createUser(action.payload).pipe(
                    map((user) => UsersActions.createUserSuccess({ user })),
                    catchError((error) =>
                        of(UsersActions.createUserFailure({ message: errorMessage(error, 'Erro ao criar usuário.') })),
                    ),
                ),
            ),
        ),
    );

    createUserSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.createUserSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Usuário criado com sucesso!')),
            ),
        { dispatch: false },
    );

    createUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.createUserFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    updateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.updateUser),
            exhaustMap((action) =>
                this.userService.updateUser(action.id, action.payload).pipe(
                    map((user) => UsersActions.updateUserSuccess({ user })),
                    catchError((error) =>
                        of(UsersActions.updateUserFailure({ message: errorMessage(error, 'Erro ao atualizar usuário.') })),
                    ),
                ),
            ),
        ),
    );

    updateUserSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.updateUserSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Usuário atualizado com sucesso!')),
            ),
        { dispatch: false },
    );

    updateUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.updateUserFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UsersActions.resetPassword),
            exhaustMap((action) =>
                this.userService.resetPassword(action.email).pipe(
                    map(() => UsersActions.resetPasswordSuccess()),
                    catchError((error) =>
                        of(UsersActions.resetPasswordFailure({ message: errorMessage(error, 'Erro ao resetar senha.') })),
                    ),
                ),
            ),
        ),
    );

    resetPasswordSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.resetPasswordSuccess),
                tap(() => this.toast.show(ToastType.Success, 'Senha resetada com sucesso!')),
            ),
        { dispatch: false },
    );

    resetPasswordFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UsersActions.resetPasswordFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
