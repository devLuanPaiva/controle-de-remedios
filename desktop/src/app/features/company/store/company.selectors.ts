import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CompanyState } from './company.state';

export const selectCompanyState = createFeatureSelector<CompanyState>('company');

export const selectAllCompanies = createSelector(selectCompanyState, (state) => state.items);

export const selectCompaniesLoading = createSelector(selectCompanyState, (state) => state.loading);

export const selectCompaniesError = createSelector(selectCompanyState, (state) => state.error);

export const selectCompaniesMutating = createSelector(selectCompanyState, (state) => state.mutating);

export const selectSelectedCompanyId = createSelector(selectCompanyState, (state) => state.selectedCompanyId);

export const selectSelectedCompany = createSelector(
    selectAllCompanies,
    selectSelectedCompanyId,
    (companies, selectedCompanyId) => companies.find((company) => company.id === selectedCompanyId) ?? null,
);

export const selectAssociatedUsers = createSelector(selectCompanyState, (state) => state.associatedUsers);

export const selectAssociatedUsersLoading = createSelector(selectCompanyState, (state) => state.associatedUsersLoading);

export const selectAssociatedUsersMutating = createSelector(selectCompanyState, (state) => state.associatedUsersMutating);
