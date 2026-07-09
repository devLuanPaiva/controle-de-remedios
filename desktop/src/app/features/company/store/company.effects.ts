import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { CompanyService } from '../services/company.service';
import * as CompanyActions from './company.actions';

@Injectable()
export class CompanyEffects {
    private readonly actions$ = inject(Actions);
    private readonly companyService = inject(CompanyService);
    private readonly toast = inject(ToastService);

    loadCompanies$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.loadCompanies),
            switchMap(() =>
                this.companyService.getCompanies().pipe(
                    map((companies) => CompanyActions.loadCompaniesSuccess({ companies })),
                    catchError((error) =>
                        of(CompanyActions.loadCompaniesFailure({ message: extractErrorMessage(error, 'Erro ao carregar empresas.') })),
                    ),
                ),
            ),
        ),
    );

    loadCompaniesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.loadCompaniesFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    createCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.createCompany),
            exhaustMap((action) =>
                this.companyService.createCompany(action.payload).pipe(
                    map((company) => CompanyActions.createCompanySuccess({ company })),
                    catchError((error) =>
                        of(CompanyActions.createCompanyFailure({ message: extractErrorMessage(error, 'Erro ao criar empresa.') })),
                    ),
                ),
            ),
        ),
    );

    createCompanySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.createCompanySuccess),
                tap(() => this.toast.show(ToastType.Success, 'Empresa criada com sucesso!')),
            ),
        { dispatch: false },
    );

    createCompanyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.createCompanyFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    updateCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.updateCompany),
            exhaustMap((action) =>
                this.companyService.updateCompany(action.id, action.payload).pipe(
                    map((company) => CompanyActions.updateCompanySuccess({ company })),
                    catchError((error) =>
                        of(CompanyActions.updateCompanyFailure({ message: extractErrorMessage(error, 'Erro ao atualizar empresa.') })),
                    ),
                ),
            ),
        ),
    );

    updateCompanySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.updateCompanySuccess),
                tap(() => this.toast.show(ToastType.Success, 'Empresa atualizada com sucesso!')),
            ),
        { dispatch: false },
    );

    updateCompanyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.updateCompanyFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    loadCompanyUsers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.loadCompanyUsers),
            switchMap((action) =>
                this.companyService.getCompanyUsers(action.companyId).pipe(
                    map((users) => CompanyActions.loadCompanyUsersSuccess({ users })),
                    catchError((error) =>
                        of(
                            CompanyActions.loadCompanyUsersFailure({
                                message: extractErrorMessage(error, 'Erro ao carregar usuários da empresa.'),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    loadCompanyUsersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.loadCompanyUsersFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    associateUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.associateUser),
            exhaustMap((action) =>
                this.companyService.associateUser(action.companyId, action.userId).pipe(
                    map(() => CompanyActions.associateUserSuccess({ companyId: action.companyId })),
                    catchError((error) =>
                        of(CompanyActions.associateUserFailure({ message: extractErrorMessage(error, 'Erro ao associar usuário.') })),
                    ),
                ),
            ),
        ),
    );

    associateUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.associateUserSuccess),
            tap(() => this.toast.show(ToastType.Success, 'Usuário associado com sucesso!')),
            map((action) => CompanyActions.loadCompanyUsers({ companyId: action.companyId })),
        ),
    );

    associateUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.associateUserFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );

    removeUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.removeUser),
            exhaustMap((action) =>
                this.companyService.removeUser(action.companyId, action.userId).pipe(
                    map(() => CompanyActions.removeUserSuccess({ companyId: action.companyId })),
                    catchError((error) =>
                        of(CompanyActions.removeUserFailure({ message: extractErrorMessage(error, 'Erro ao remover usuário.') })),
                    ),
                ),
            ),
        ),
    );

    removeUserSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyActions.removeUserSuccess),
            tap(() => this.toast.show(ToastType.Success, 'Usuário removido com sucesso!')),
            map((action) => CompanyActions.loadCompanyUsers({ companyId: action.companyId })),
        ),
    );

    removeUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CompanyActions.removeUserFailure),
                tap((action) => this.toast.show(ToastType.Error, action.message)),
            ),
        { dispatch: false },
    );
}
