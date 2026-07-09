import { createReducer, on } from '@ngrx/store';

import * as CompanyActions from './company.actions';
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

export const companyReducer = createReducer(
    initialState,

    on(CompanyActions.loadCompanies, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(CompanyActions.loadCompaniesSuccess, (state, { companies }) => ({
        ...state,
        items: companies,
        loading: false,
        selectedCompanyId: state.selectedCompanyId ?? companies[0]?.id ?? null,
    })),

    on(CompanyActions.loadCompaniesFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(CompanyActions.selectCompany, (state, { companyId }) => ({
        ...state,
        selectedCompanyId: companyId,
    })),

    on(CompanyActions.createCompany, (state) => ({
        ...state,
        mutating: true,
    })),

    on(CompanyActions.createCompanySuccess, (state, { company }) => ({
        ...state,
        mutating: false,
        items: [company, ...state.items],
        selectedCompanyId: state.selectedCompanyId ?? company.id,
    })),

    on(CompanyActions.createCompanyFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(CompanyActions.updateCompany, (state) => ({
        ...state,
        mutating: true,
    })),

    on(CompanyActions.updateCompanySuccess, (state, { company }) => ({
        ...state,
        mutating: false,
        items: state.items.map((item) => (item.id === company.id ? company : item)),
    })),

    on(CompanyActions.updateCompanyFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(CompanyActions.loadCompanyUsers, (state) => ({
        ...state,
        associatedUsers: [],
        associatedUsersLoading: true,
    })),

    on(CompanyActions.loadCompanyUsersSuccess, (state, { users }) => ({
        ...state,
        associatedUsers: users,
        associatedUsersLoading: false,
    })),

    on(CompanyActions.loadCompanyUsersFailure, (state, { message }) => ({
        ...state,
        associatedUsersLoading: false,
        error: message,
    })),

    on(CompanyActions.associateUser, (state) => ({
        ...state,
        associatedUsersMutating: true,
    })),

    on(CompanyActions.associateUserSuccess, (state) => ({
        ...state,
        associatedUsersMutating: false,
    })),

    on(CompanyActions.associateUserFailure, (state, { message }) => ({
        ...state,
        associatedUsersMutating: false,
        error: message,
    })),

    on(CompanyActions.removeUser, (state) => ({
        ...state,
        associatedUsersMutating: true,
    })),

    on(CompanyActions.removeUserSuccess, (state) => ({
        ...state,
        associatedUsersMutating: false,
    })),

    on(CompanyActions.removeUserFailure, (state, { message }) => ({
        ...state,
        associatedUsersMutating: false,
        error: message,
    })),

    on(CompanyActions.clearAssociatedUsers, (state) => ({
        ...state,
        associatedUsers: [],
    })),
);
