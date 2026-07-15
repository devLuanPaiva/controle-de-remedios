import { Action } from '@ngrx/store';
import { describe, expect, it } from 'vitest';

import { IUser, UserRole } from '@features/users/models/user.model';

import { ICompany } from '../models/company.model';
import * as CompanyActions from './company.actions';
import { companyReducer } from './company.reducer';
import { CompanyState } from './company.state';

const initialState: CompanyState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    selectedCompanyId: null,
    associatedUsers: [],
    associatedUsersLoading: false,
    associatedUsersMutating: false,
};

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

describe('companyReducer', () => {
    it('should return the initial state when state is undefined and the action is unknown', () => {
        const unknownAction: Action = { type: '@@UNKNOWN_ACTION' };

        expect(companyReducer(undefined, unknownAction)).toEqual(initialState);
    });

    it('should return the exact same state reference for an unknown action', () => {
        const currentState: CompanyState = { ...initialState, loading: true };
        const unknownAction: Action = { type: '[Company] Something Else' };

        expect(companyReducer(currentState, unknownAction)).toBe(currentState);
    });

    describe('loadCompanies', () => {
        it('should set loading to true and clear a previous error', () => {
            const state: CompanyState = { ...initialState, error: 'previous error' };

            const result = companyReducer(state, CompanyActions.loadCompanies());

            expect(result).toEqual({ ...state, loading: true, error: null });
        });
    });

    describe('loadCompaniesSuccess', () => {
        it('should store the companies, stop loading and auto-select the first one when nothing was selected', () => {
            const companies = [buildCompany({ id: 'a' }), buildCompany({ id: 'b' })];
            const state: CompanyState = { ...initialState, loading: true };

            const result = companyReducer(state, CompanyActions.loadCompaniesSuccess({ companies }));

            expect(result.items).toEqual(companies);
            expect(result.selectedCompanyId).toBe('a');
            expect(result.loading).toBe(false);
        });

        it('should keep a previously selected company id even if it is no longer present in the new list', () => {
            const companies = [buildCompany({ id: 'b' })];
            const state: CompanyState = { ...initialState, selectedCompanyId: 'stale-id' };

            const result = companyReducer(state, CompanyActions.loadCompaniesSuccess({ companies }));

            expect(result.selectedCompanyId).toBe('stale-id');
        });

        it('should leave selectedCompanyId as null when the fetched list is empty and nothing was selected', () => {
            const result = companyReducer(initialState, CompanyActions.loadCompaniesSuccess({ companies: [] }));

            expect(result.selectedCompanyId).toBeNull();
        });
    });

    describe('loadCompaniesFailure', () => {
        it('should stop loading and store the error message', () => {
            const state: CompanyState = { ...initialState, loading: true };

            const result = companyReducer(state, CompanyActions.loadCompaniesFailure({ message: 'boom' }));

            expect(result).toEqual({ ...state, loading: false, error: 'boom' });
        });
    });

    describe('selectCompany', () => {
        it('should set selectedCompanyId to the given id, even when it matches no loaded company', () => {
            const state: CompanyState = { ...initialState, items: [buildCompany({ id: 'a' })] };

            const result = companyReducer(state, CompanyActions.selectCompany({ companyId: 'unknown-id' }));

            expect(result.selectedCompanyId).toBe('unknown-id');
        });
    });

    describe('createCompany / createCompanySuccess / createCompanyFailure', () => {
        it('should set mutating to true on createCompany', () => {
            const result = companyReducer(
                initialState,
                CompanyActions.createCompany({ payload: { name: 'Acme', cnpj: '11222333000181' } }),
            );

            expect(result.mutating).toBe(true);
        });

        it('should prepend the new company and select it when nothing was previously selected', () => {
            const existing = buildCompany({ id: 'existing' });
            const created = buildCompany({ id: 'new' });
            const state: CompanyState = { ...initialState, items: [existing], mutating: true };

            const result = companyReducer(state, CompanyActions.createCompanySuccess({ company: created }));

            expect(result.items).toEqual([created, existing]);
            expect(result.selectedCompanyId).toBe('new');
            expect(result.mutating).toBe(false);
        });

        it('should not change the current selection when a company was already selected', () => {
            const created = buildCompany({ id: 'new' });
            const state: CompanyState = { ...initialState, selectedCompanyId: 'already-selected', mutating: true };

            const result = companyReducer(state, CompanyActions.createCompanySuccess({ company: created }));

            expect(result.selectedCompanyId).toBe('already-selected');
        });

        it('should stop mutating and store the error on createCompanyFailure', () => {
            const state: CompanyState = { ...initialState, mutating: true };

            const result = companyReducer(state, CompanyActions.createCompanyFailure({ message: 'conflict' }));

            expect(result).toEqual({ ...state, mutating: false, error: 'conflict' });
        });
    });

    describe('updateCompany / updateCompanySuccess / updateCompanyFailure', () => {
        it('should set mutating to true on updateCompany', () => {
            const result = companyReducer(initialState, CompanyActions.updateCompany({ id: 'a', payload: {} }));

            expect(result.mutating).toBe(true);
        });

        it('should replace only the matching company and leave the others untouched', () => {
            const untouched = buildCompany({ id: 'untouched', name: 'Untouched' });
            const original = buildCompany({ id: 'target', name: 'Old Name' });
            const updated = buildCompany({ id: 'target', name: 'New Name' });
            const state: CompanyState = { ...initialState, items: [untouched, original], mutating: true };

            const result = companyReducer(state, CompanyActions.updateCompanySuccess({ company: updated }));

            expect(result.items).toEqual([untouched, updated]);
            expect(result.mutating).toBe(false);
        });

        it('should stop mutating and store the error on updateCompanyFailure', () => {
            const state: CompanyState = { ...initialState, mutating: true };

            const result = companyReducer(state, CompanyActions.updateCompanyFailure({ message: 'not allowed' }));

            expect(result).toEqual({ ...state, mutating: false, error: 'not allowed' });
        });
    });

    describe('loadCompanyUsers / loadCompanyUsersSuccess / loadCompanyUsersFailure', () => {
        it('should clear associatedUsers and set associatedUsersLoading to true', () => {
            const state: CompanyState = { ...initialState, associatedUsers: [buildUser()] };

            const result = companyReducer(state, CompanyActions.loadCompanyUsers({ companyId: 'a' }));

            expect(result.associatedUsers).toEqual([]);
            expect(result.associatedUsersLoading).toBe(true);
        });

        it('should store the fetched users and stop loading on success', () => {
            const users = [buildUser({ id: 'u1' }), buildUser({ id: 'u2' })];
            const state: CompanyState = { ...initialState, associatedUsersLoading: true };

            const result = companyReducer(state, CompanyActions.loadCompanyUsersSuccess({ users }));

            expect(result.associatedUsers).toEqual(users);
            expect(result.associatedUsersLoading).toBe(false);
        });

        it('should stop loading and store the error on failure', () => {
            const state: CompanyState = { ...initialState, associatedUsersLoading: true };

            const result = companyReducer(state, CompanyActions.loadCompanyUsersFailure({ message: 'forbidden' }));

            expect(result.associatedUsersLoading).toBe(false);
            expect(result.error).toBe('forbidden');
        });
    });

    describe('associateUser / associateUserSuccess / associateUserFailure', () => {
        it('should set associatedUsersMutating to true on associateUser', () => {
            const result = companyReducer(initialState, CompanyActions.associateUser({ companyId: 'a', userId: 'u1' }));

            expect(result.associatedUsersMutating).toBe(true);
        });

        it('should stop mutating on success without touching associatedUsers directly', () => {
            const users = [buildUser()];
            const state: CompanyState = { ...initialState, associatedUsersMutating: true, associatedUsers: users };

            const result = companyReducer(state, CompanyActions.associateUserSuccess({ companyId: 'a' }));

            expect(result.associatedUsersMutating).toBe(false);
            expect(result.associatedUsers).toBe(users);
        });

        it('should stop mutating and store the error on failure', () => {
            const state: CompanyState = { ...initialState, associatedUsersMutating: true };

            const result = companyReducer(state, CompanyActions.associateUserFailure({ message: 'cannot manage this role' }));

            expect(result.associatedUsersMutating).toBe(false);
            expect(result.error).toBe('cannot manage this role');
        });
    });

    describe('removeUser / removeUserSuccess / removeUserFailure', () => {
        it('should set associatedUsersMutating to true on removeUser', () => {
            const result = companyReducer(initialState, CompanyActions.removeUser({ companyId: 'a', userId: 'u1' }));

            expect(result.associatedUsersMutating).toBe(true);
        });

        it('should stop mutating on success', () => {
            const state: CompanyState = { ...initialState, associatedUsersMutating: true };

            const result = companyReducer(state, CompanyActions.removeUserSuccess({ companyId: 'a' }));

            expect(result.associatedUsersMutating).toBe(false);
        });

        it('should stop mutating and store the error on failure', () => {
            const state: CompanyState = { ...initialState, associatedUsersMutating: true };

            const result = companyReducer(state, CompanyActions.removeUserFailure({ message: 'cannot remove' }));

            expect(result.associatedUsersMutating).toBe(false);
            expect(result.error).toBe('cannot remove');
        });
    });

    describe('clearAssociatedUsers', () => {
        it('should reset associatedUsers to an empty array', () => {
            const state: CompanyState = { ...initialState, associatedUsers: [buildUser()] };

            const result = companyReducer(state, CompanyActions.clearAssociatedUsers());

            expect(result.associatedUsers).toEqual([]);
        });
    });
});
