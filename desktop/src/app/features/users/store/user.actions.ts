import { createAction, props } from '@ngrx/store';

import { CreateUserRequest, UpdateUserRequest } from '../models/user-api.model';
import { IUser } from '../models/user.model';

export const loadUsers = createAction(
    '[Users] Load Users',
    props<{ page: number }>(),
);

export const loadUsersSuccess = createAction(
    '[Users] Load Users Success',
    props<{
        users: IUser[];
        count: number;
        currentPage: number;
        totalPages: number;
        next: string | null;
        previous: string | null;
    }>(),
);

export const loadUsersFailure = createAction(
    '[Users] Load Users Failure',
    props<{ message: string }>(),
);

export const loadUser = createAction(
    '[Users] Load User',
    props<{ id: string }>(),
);

export const loadUserSuccess = createAction(
    '[Users] Load User Success',
    props<{ user: IUser }>(),
);

export const loadUserFailure = createAction(
    '[Users] Load User Failure',
    props<{ message: string }>(),
);

export const createUser = createAction(
    '[Users] Create User',
    props<{ payload: CreateUserRequest }>(),
);

export const createUserSuccess = createAction(
    '[Users] Create User Success',
    props<{ user: IUser }>(),
);

export const createUserFailure = createAction(
    '[Users] Create User Failure',
    props<{ message: string }>(),
);

export const updateUser = createAction(
    '[Users] Update User',
    props<{ id: string; payload: UpdateUserRequest }>(),
);

export const updateUserSuccess = createAction(
    '[Users] Update User Success',
    props<{ user: IUser }>(),
);

export const updateUserFailure = createAction(
    '[Users] Update User Failure',
    props<{ message: string }>(),
);

export const resetPassword = createAction(
    '[Users] Reset Password',
    props<{ email: string }>(),
);

export const resetPasswordSuccess = createAction(
    '[Users] Reset Password Success',
);

export const resetPasswordFailure = createAction(
    '[Users] Reset Password Failure',
    props<{ message: string }>(),
);

export const clearSelectedUser = createAction(
    '[Users] Clear Selected User',
);
