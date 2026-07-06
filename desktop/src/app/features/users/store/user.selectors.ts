import { createFeatureSelector, createSelector } from '@ngrx/store';

import { selectUser as selectAuthUser } from '@features/auth/store/auth.selectors';

import { getManageableRoles, normalizeUserRole } from '../models/user.model';
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

export const selectManageableRolesForCurrentUser = createSelector(selectAuthUser, (user) =>
    getManageableRoles(normalizeUserRole(user?.role)),
);

export const selectVisibleUsers = createSelector(
    selectAllUsers,
    selectManageableRolesForCurrentUser,
    (users, manageableRoles) => users.filter((user) => manageableRoles.includes(user.role)),
);
