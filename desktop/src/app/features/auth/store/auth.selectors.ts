import {
    createFeatureSelector,
    createSelector
} from '@ngrx/store';

import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
    selectAuthState,
    (state) => state.user
)

export const selectAuthenticated =
    createSelector(
        selectAuthState,
        state => state.authenticated
    );

export const selectAuthLoading =
    createSelector(
        selectAuthState,
        state => state.loading
    );

export const selectForgotPasswordLoading = createSelector(
    selectAuthState,
    state => state.forgotPasswordLoading
);

export const selectForgotPasswordSubmitted = createSelector(
    selectAuthState,
    state => state.forgotPasswordSubmitted
);

export const selectResetPasswordLoading = createSelector(
    selectAuthState,
    state => state.resetPasswordLoading
);

export const selectResetPasswordErrors = createSelector(
    selectAuthState,
    state => state.resetPasswordErrors
);

export const selectChangePasswordLoading = createSelector(
    selectAuthState,
    state => state.changePasswordLoading
);

export const selectChangePasswordErrors = createSelector(
    selectAuthState,
    state => state.changePasswordErrors
);

export const selectChangePasswordSuccess = createSelector(
    selectAuthState,
    state => state.changePasswordSuccess
);