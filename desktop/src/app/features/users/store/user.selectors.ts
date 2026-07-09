import { createFeatureSelector, createSelector } from '@ngrx/store';

import { UsersState } from './user.state';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectAllUsers = createSelector(selectUsersState, (state) => state.items);

export const selectUsersLoading = createSelector(selectUsersState, (state) => state.loading);

export const selectUsersError = createSelector(selectUsersState, (state) => state.error);

export const selectUsersMutating = createSelector(selectUsersState, (state) => state.mutating);

export const selectUsersPagination = createSelector(selectUsersState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));

export const selectSelectedUser = createSelector(selectUsersState, (state) => state.selectedUser);

export const selectSelectedUserLoading = createSelector(selectUsersState, (state) => state.selectedUserLoading);
