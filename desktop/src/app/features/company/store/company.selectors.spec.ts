import { describe, expect, it } from 'vitest';

import { IUser, UserRole } from '@features/users/models/user.model';

import { ICompany } from '../models/company.model';
import {
    selectAllCompanies,
    selectAssociatedUsers,
    selectAssociatedUsersLoading,
    selectAssociatedUsersMutating,
    selectCompaniesError,
    selectCompaniesLoading,
    selectCompaniesMutating,
    selectSelectedCompany,
    selectSelectedCompanyId,
} from './company.selectors';
import { CompanyState } from './company.state';

interface RootState {
    company: CompanyState;
}

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
        role: UserRole.USER,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-01T10:00:00Z'),
        ...overrides,
    };
}

function buildRootState(overrides: Partial<CompanyState> = {}): RootState {
    return {
        company: {
            items: [],
            loading: false,
            error: null,
            mutating: false,
            selectedCompanyId: null,
            associatedUsers: [],
            associatedUsersLoading: false,
            associatedUsersMutating: false,
            ...overrides,
        },
    };
}

describe('Company Selectors', () => {
    const companies = [buildCompany({ id: 'a' }), buildCompany({ id: 'b' })];
    const users = [buildUser({ id: 'u1' })];

    const cases: Array<{
        name: string;
        selector: (state: RootState) => unknown;
        overrides: Partial<CompanyState>;
        expected: unknown;
    }> = [
        {
            name: 'selectAllCompanies returns the companies list',
            selector: selectAllCompanies,
            overrides: { items: companies },
            expected: companies,
        },
        {
            name: 'selectCompaniesLoading returns true while loading',
            selector: selectCompaniesLoading,
            overrides: { loading: true },
            expected: true,
        },
        {
            name: 'selectCompaniesLoading returns false when not loading',
            selector: selectCompaniesLoading,
            overrides: { loading: false },
            expected: false,
        },
        {
            name: 'selectCompaniesError returns the stored error message',
            selector: selectCompaniesError,
            overrides: { error: 'boom' },
            expected: 'boom',
        },
        {
            name: 'selectCompaniesError returns null when there is no error',
            selector: selectCompaniesError,
            overrides: { error: null },
            expected: null,
        },
        {
            name: 'selectCompaniesMutating returns true while a mutation is in flight',
            selector: selectCompaniesMutating,
            overrides: { mutating: true },
            expected: true,
        },
        {
            name: 'selectSelectedCompanyId returns the currently selected id',
            selector: selectSelectedCompanyId,
            overrides: { selectedCompanyId: 'a' },
            expected: 'a',
        },
        {
            name: 'selectAssociatedUsers returns the associated users list',
            selector: selectAssociatedUsers,
            overrides: { associatedUsers: users },
            expected: users,
        },
        {
            name: 'selectAssociatedUsersLoading returns true while loading',
            selector: selectAssociatedUsersLoading,
            overrides: { associatedUsersLoading: true },
            expected: true,
        },
        {
            name: 'selectAssociatedUsersMutating returns true while mutating',
            selector: selectAssociatedUsersMutating,
            overrides: { associatedUsersMutating: true },
            expected: true,
        },
    ];

    it.each(cases)('$name', ({ selector, overrides, expected }) => {
        const rootState = buildRootState(overrides);

        expect(selector(rootState)).toEqual(expected);
    });

    describe('selectSelectedCompany', () => {
        it('should return the company matching the selected id', () => {
            const rootState = buildRootState({ items: companies, selectedCompanyId: 'b' });

            expect(selectSelectedCompany(rootState)).toEqual(companies[1]);
        });

        it('should return null when no company is selected', () => {
            const rootState = buildRootState({ items: companies, selectedCompanyId: null });

            expect(selectSelectedCompany(rootState)).toBeNull();
        });

        it('should return null when the selected id no longer matches any loaded company', () => {
            const rootState = buildRootState({ items: companies, selectedCompanyId: 'stale-id' });

            expect(selectSelectedCompany(rootState)).toBeNull();
        });
    });
});
