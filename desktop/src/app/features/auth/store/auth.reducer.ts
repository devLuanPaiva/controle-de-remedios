import { createReducer, on } from "@ngrx/store";
import * as AuthActions from "./auth.actions";
import { AuthState } from "./auth.state";

const initialState: AuthState = {
    user: null,
    loading: false,
    authenticated: false,

    forgotPasswordLoading: false,
    forgotPasswordSubmitted: false,

    resetPasswordLoading: false,
    resetPasswordErrors: [],

    changePasswordLoading: false,
    changePasswordErrors: [],
    changePasswordSuccess: false,
};

export const authReducer = createReducer(
    initialState,

    on(
        AuthActions.login,
        (state) => ({
            ...state,
            loading: true
        })
    ),

    on(
        AuthActions.loginSuccess,
        (state, { user }) => ({
            ...state,
            user,
            loading: false,
            authenticated: true
        })
    ),
    on(
        AuthActions.loginFailure,

        state => ({

            ...state,

            loading: false,

            authenticated: false
        })
    ),

    on(
        AuthActions.logout,

        () => initialState
    ),

    on(AuthActions.forgotPassword, (state) => ({
        ...state,
        forgotPasswordLoading: true,
        forgotPasswordSubmitted: false,
    })),

    on(AuthActions.forgotPasswordSuccess, (state) => ({
        ...state,
        forgotPasswordLoading: false,
        forgotPasswordSubmitted: true,
    })),

    on(AuthActions.forgotPasswordFailure, (state) => ({
        ...state,
        forgotPasswordLoading: false,
    })),

    on(AuthActions.resetPassword, (state) => ({
        ...state,
        resetPasswordLoading: true,
        resetPasswordErrors: [],
    })),

    on(AuthActions.resetPasswordSuccess, (state) => ({
        ...state,
        resetPasswordLoading: false,
        resetPasswordErrors: [],
    })),

    on(AuthActions.resetPasswordFailure, (state, { errors }) => ({
        ...state,
        resetPasswordLoading: false,
        resetPasswordErrors: errors,
    })),

    on(AuthActions.changePassword, (state) => ({
        ...state,
        changePasswordLoading: true,
        changePasswordErrors: [],
        changePasswordSuccess: false,
    })),

    on(AuthActions.changePasswordSuccess, (state) => ({
        ...state,
        changePasswordLoading: false,
        changePasswordErrors: [],
        changePasswordSuccess: true,
    })),

    on(AuthActions.changePasswordFailure, (state, { errors }) => ({
        ...state,
        changePasswordLoading: false,
        changePasswordErrors: errors,
        changePasswordSuccess: false,
    })),

)