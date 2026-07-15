import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { IUser, UserRole } from '@features/users/models/user.model';

import { ICompany } from '../models/company.model';
import { CompanyService } from '../services/company.service';
import * as CompanyActions from './company.actions';
import { CompanyEffects } from './company.effects';

function buildCompany(overrides: Partial<ICompany> = {}): ICompany {
    return {
        id: 'company-1',
        name: 'Acme',
        slug: 'acme',
        cnpj: '11222333000181',
        imageUrl: undefined,
        active: true,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-01T10:00:00Z'),
        ...overrides,
    };
}

function buildUser(overrides: Partial<IUser> = {}): IUser {
    return {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        imageUrl: undefined,
        cpf: '12345678901',
        role: UserRole.ASSISTANT,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-01T10:00:00Z'),
        ...overrides,
    };
}

function buildHttpError(detail: string): HttpErrorResponse {
    return new HttpErrorResponse({
        status: 400,
        error: {
            status: 'error',
            message: 'Erro de validação',
            data: null,
            errors: { code: 'VALIDATION_ERROR', field: null, detail },
        },
    });
}

interface CompanyServiceMock {
    getCompanies: ReturnType<typeof vi.fn>;
    createCompany: ReturnType<typeof vi.fn>;
    updateCompany: ReturnType<typeof vi.fn>;
    getCompanyUsers: ReturnType<typeof vi.fn>;
    associateUser: ReturnType<typeof vi.fn>;
    removeUser: ReturnType<typeof vi.fn>;
}

interface ToastServiceMock {
    show: ReturnType<typeof vi.fn>;
}

function setup(actions$: Observable<Action>) {
    const companyService: CompanyServiceMock = {
        getCompanies: vi.fn(),
        createCompany: vi.fn(),
        updateCompany: vi.fn(),
        getCompanyUsers: vi.fn(),
        associateUser: vi.fn(),
        removeUser: vi.fn(),
    };
    const toast: ToastServiceMock = { show: vi.fn() };

    TestBed.configureTestingModule({
        providers: [
            CompanyEffects,
            provideMockActions(() => actions$),
            { provide: CompanyService, useValue: companyService as unknown as CompanyService },
            { provide: ToastService, useValue: toast as unknown as ToastService },
        ],
    });

    const effects = TestBed.inject(CompanyEffects);
    return { effects, companyService, toast };
}

describe('CompanyEffects', () => {
    describe('loadCompanies$', () => {
        it('should map a successful fetch into loadCompaniesSuccess', async () => {
            const companies = [buildCompany()];
            const { effects, companyService } = setup(of(CompanyActions.loadCompanies()));
            companyService.getCompanies.mockReturnValue(of(companies));

            const result = await firstValueFrom(effects.loadCompanies$);

            expect(result).toEqual(CompanyActions.loadCompaniesSuccess({ companies }));
        });

        it('should map a failed fetch into loadCompaniesFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(of(CompanyActions.loadCompanies()));
            companyService.getCompanies.mockReturnValue(throwError(() => buildHttpError('database unreachable')));

            const result = await firstValueFrom(effects.loadCompanies$);

            expect(result).toEqual(CompanyActions.loadCompaniesFailure({ message: 'database unreachable' }));
        });
    });

    describe('createCompany$', () => {
        it('should map a successful creation into createCompanySuccess', async () => {
            const company = buildCompany({ id: 'new-company' });
            const { effects, companyService } = setup(
                of(CompanyActions.createCompany({ payload: { name: 'Acme', cnpj: '11222333000181' } })),
            );
            companyService.createCompany.mockReturnValue(of(company));

            const result = await firstValueFrom(effects.createCompany$);

            expect(result).toEqual(CompanyActions.createCompanySuccess({ company }));
        });

        it('should map a failed creation into createCompanyFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.createCompany({ payload: { name: 'Acme', cnpj: '11222333000181' } })),
            );
            companyService.createCompany.mockReturnValue(throwError(() => buildHttpError('CNPJ already registered')));

            const result = await firstValueFrom(effects.createCompany$);

            expect(result).toEqual(CompanyActions.createCompanyFailure({ message: 'CNPJ already registered' }));
        });
    });

    describe('updateCompany$', () => {
        it('should map a successful update into updateCompanySuccess', async () => {
            const company = buildCompany({ name: 'New Name' });
            const { effects, companyService } = setup(
                of(CompanyActions.updateCompany({ id: 'company-1', payload: { name: 'New Name' } })),
            );
            companyService.updateCompany.mockReturnValue(of(company));

            const result = await firstValueFrom(effects.updateCompany$);

            expect(result).toEqual(CompanyActions.updateCompanySuccess({ company }));
        });

        it('should map a failed update into updateCompanyFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.updateCompany({ id: 'company-1', payload: { name: 'New Name' } })),
            );
            companyService.updateCompany.mockReturnValue(throwError(() => buildHttpError('not a member of this company')));

            const result = await firstValueFrom(effects.updateCompany$);

            expect(result).toEqual(CompanyActions.updateCompanyFailure({ message: 'not a member of this company' }));
        });
    });

    describe('loadCompanyUsers$', () => {
        it('should map a successful fetch into loadCompanyUsersSuccess', async () => {
            const users = [buildUser()];
            const { effects, companyService } = setup(of(CompanyActions.loadCompanyUsers({ companyId: 'company-1' })));
            companyService.getCompanyUsers.mockReturnValue(of(users));

            const result = await firstValueFrom(effects.loadCompanyUsers$);

            expect(result).toEqual(CompanyActions.loadCompanyUsersSuccess({ users }));
        });

        it('should map a failed fetch into loadCompanyUsersFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(of(CompanyActions.loadCompanyUsers({ companyId: 'company-1' })));
            companyService.getCompanyUsers.mockReturnValue(throwError(() => buildHttpError('access denied')));

            const result = await firstValueFrom(effects.loadCompanyUsers$);

            expect(result).toEqual(CompanyActions.loadCompanyUsersFailure({ message: 'access denied' }));
        });
    });

    describe('associateUser$', () => {
        it('should map a successful association into associateUserSuccess for the same company', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.associateUser({ companyId: 'company-1', userId: 'user-1' })),
            );
            companyService.associateUser.mockReturnValue(of(undefined));

            const result = await firstValueFrom(effects.associateUser$);

            expect(result).toEqual(CompanyActions.associateUserSuccess({ companyId: 'company-1' }));
        });

        it('should map a failed association into associateUserFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.associateUser({ companyId: 'company-1', userId: 'user-1' })),
            );
            companyService.associateUser.mockReturnValue(throwError(() => buildHttpError('cannot manage this role')));

            const result = await firstValueFrom(effects.associateUser$);

            expect(result).toEqual(CompanyActions.associateUserFailure({ message: 'cannot manage this role' }));
        });
    });

    describe('associateUserSuccess$', () => {
        it('should show a success toast and trigger a reload of the company users', async () => {
            const { effects, toast } = setup(of(CompanyActions.associateUserSuccess({ companyId: 'company-1' })));

            const result = await firstValueFrom(effects.associateUserSuccess$);

            expect(toast.show).toHaveBeenCalledWith(ToastType.Success, 'Usuário associado com sucesso!');
            expect(result).toEqual(CompanyActions.loadCompanyUsers({ companyId: 'company-1' }));
        });
    });

    describe('removeUser$', () => {
        it('should map a successful removal into removeUserSuccess for the same company', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.removeUser({ companyId: 'company-1', userId: 'user-1' })),
            );
            companyService.removeUser.mockReturnValue(of(undefined));

            const result = await firstValueFrom(effects.removeUser$);

            expect(result).toEqual(CompanyActions.removeUserSuccess({ companyId: 'company-1' }));
        });

        it('should map a failed removal into removeUserFailure using the extracted error detail', async () => {
            const { effects, companyService } = setup(
                of(CompanyActions.removeUser({ companyId: 'company-1', userId: 'user-1' })),
            );
            companyService.removeUser.mockReturnValue(throwError(() => buildHttpError('cannot remove yourself')));

            const result = await firstValueFrom(effects.removeUser$);

            expect(result).toEqual(CompanyActions.removeUserFailure({ message: 'cannot remove yourself' }));
        });
    });

    describe('removeUserSuccess$', () => {
        it('should show a success toast and trigger a reload of the company users', async () => {
            const { effects, toast } = setup(of(CompanyActions.removeUserSuccess({ companyId: 'company-1' })));

            const result = await firstValueFrom(effects.removeUserSuccess$);

            expect(toast.show).toHaveBeenCalledWith(ToastType.Success, 'Usuário removido com sucesso!');
            expect(result).toEqual(CompanyActions.loadCompanyUsers({ companyId: 'company-1' }));
        });
    });

    describe('success toast effects (dispatch: false)', () => {
        const cases: Array<{ name: string; getEffect: (effects: CompanyEffects) => Observable<unknown>; action: Action; message: string }> = [
            {
                name: 'createCompanySuccess$',
                getEffect: (effects) => effects.createCompanySuccess$,
                action: CompanyActions.createCompanySuccess({ company: buildCompany() }),
                message: 'Empresa criada com sucesso!',
            },
            {
                name: 'updateCompanySuccess$',
                getEffect: (effects) => effects.updateCompanySuccess$,
                action: CompanyActions.updateCompanySuccess({ company: buildCompany() }),
                message: 'Empresa atualizada com sucesso!',
            },
        ];

        it.each(cases)('$name should show a success toast', async ({ getEffect, action, message }) => {
            const { effects, toast } = setup(of(action));

            await firstValueFrom(getEffect(effects));

            expect(toast.show).toHaveBeenCalledWith(ToastType.Success, message);
        });
    });

    describe('failure toast effects (dispatch: false)', () => {
        const cases: Array<{ name: string; getEffect: (effects: CompanyEffects) => Observable<unknown>; action: Action & { message: string } }> = [
            {
                name: 'loadCompaniesFailure$',
                getEffect: (effects) => effects.loadCompaniesFailure$,
                action: CompanyActions.loadCompaniesFailure({ message: 'error loading companies' }),
            },
            {
                name: 'createCompanyFailure$',
                getEffect: (effects) => effects.createCompanyFailure$,
                action: CompanyActions.createCompanyFailure({ message: 'error creating company' }),
            },
            {
                name: 'updateCompanyFailure$',
                getEffect: (effects) => effects.updateCompanyFailure$,
                action: CompanyActions.updateCompanyFailure({ message: 'error updating company' }),
            },
            {
                name: 'loadCompanyUsersFailure$',
                getEffect: (effects) => effects.loadCompanyUsersFailure$,
                action: CompanyActions.loadCompanyUsersFailure({ message: 'error loading company users' }),
            },
            {
                name: 'associateUserFailure$',
                getEffect: (effects) => effects.associateUserFailure$,
                action: CompanyActions.associateUserFailure({ message: 'error associating user' }),
            },
            {
                name: 'removeUserFailure$',
                getEffect: (effects) => effects.removeUserFailure$,
                action: CompanyActions.removeUserFailure({ message: 'error removing user' }),
            },
        ];

        it.each(cases)('$name should show an error toast with the failure message', async ({ getEffect, action }) => {
            const { effects, toast } = setup(of(action));

            await firstValueFrom(getEffect(effects));

            expect(toast.show).toHaveBeenCalledWith(ToastType.Error, action.message);
        });
    });
});
