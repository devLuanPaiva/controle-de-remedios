import { createAction, props } from "@ngrx/store";
import { AuthUser } from "../models/auth-user.model";

export const login = createAction(
    "[Auth] Login",

    props<{ email: string; password: string }>()
)

export const loginSuccess = createAction(
    "[Auth] Login Success",
    props<{
        user: AuthUser
    }>()
)

export const logout = createAction(
    "[Auth] Logout"
)

export const loginFailure = createAction(
    "[Auth] Login Failure",
    props<{ message: string }>()
)