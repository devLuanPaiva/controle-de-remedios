import { createReducer, on } from '@ngrx/store';

import * as UsersActions from './user.actions';
import { UsersState } from './user.state';

const initialState: UsersState = {
    items: [],
    loading: false,
    error: null,
    mutating: false,
    count: 0,
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
    selectedUser: null,
    selectedUserLoading: false,
};

export const usersReducer = createReducer(
    initialState,

    on(UsersActions.loadUsers, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(UsersActions.loadUsersSuccess, (state, { users, count, currentPage, totalPages, next, previous }) => ({
        ...state,
        items: users,
        count,
        currentPage,
        totalPages,
        next,
        previous,
        loading: false,
    })),

    on(UsersActions.loadUsersFailure, (state, { message }) => ({
        ...state,
        loading: false,
        error: message,
    })),

    on(UsersActions.loadUser, (state) => ({
        ...state,
        selectedUser: null,
        selectedUserLoading: true,
    })),

    on(UsersActions.loadUserSuccess, (state, { user }) => ({
        ...state,
        selectedUser: user,
        selectedUserLoading: false,
    })),

    on(UsersActions.loadUserFailure, (state, { message }) => ({
        ...state,
        selectedUserLoading: false,
        error: message,
    })),

    on(UsersActions.createUser, (state) => ({
        ...state,
        mutating: true,
    })),

    on(UsersActions.createUserSuccess, (state, { user }) => ({
        ...state,
        mutating: false,
        items: [user, ...state.items],
        count: state.count + 1,
    })),

    on(UsersActions.createUserFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(UsersActions.updateUser, (state) => ({
        ...state,
        mutating: true,
    })),

    on(UsersActions.updateUserSuccess, (state, { user }) => ({
        ...state,
        mutating: false,
        items: state.items.map((item) => (item.id === user.id ? user : item)),
        selectedUser: state.selectedUser?.id === user.id ? user : state.selectedUser,
    })),

    on(UsersActions.updateUserFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(UsersActions.resetPassword, (state) => ({
        ...state,
        mutating: true,
    })),

    on(UsersActions.resetPasswordSuccess, (state) => ({
        ...state,
        mutating: false,
    })),

    on(UsersActions.resetPasswordFailure, (state, { message }) => ({
        ...state,
        mutating: false,
        error: message,
    })),

    on(UsersActions.clearSelectedUser, (state) => ({
        ...state,
        selectedUser: null,
    })),
);
