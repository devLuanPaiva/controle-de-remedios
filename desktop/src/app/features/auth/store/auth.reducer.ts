import { createReducer, on } from "@ngrx/store";
import * as AuthActions from "./auth.actions";
import { AuthState } from "./auth.state";

const initialState: AuthState = {
    user: null,
    loading: false,
    authenticated: false
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
    )

)