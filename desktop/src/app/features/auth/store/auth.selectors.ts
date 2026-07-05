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