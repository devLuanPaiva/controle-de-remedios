import { createAction, props } from "@ngrx/store";
import { AuthUser } from "../models/auth-user.model";
import { ApiErrorDetail } from "@shared/models/api-error.model";

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

export const loginWithGoogle = createAction(
    "[Auth] Login With Google"
)

export const loginWithGoogleCancelled = createAction(
    "[Auth] Login With Google Cancelled"
)

export const forgotPassword = createAction(
    "[Auth] Forgot Password",
    props<{ email: string }>()
)

export const forgotPasswordSuccess = createAction(
    "[Auth] Forgot Password Success"
)

export const forgotPasswordFailure = createAction(
    "[Auth] Forgot Password Failure",
    props<{ message: string }>()
)

export const resetPassword = createAction(
    "[Auth] Reset Password",
    props<{ token: string; newPassword: string; confirmPassword: string }>()
)

export const resetPasswordSuccess = createAction(
    "[Auth] Reset Password Success"
)

export const resetPasswordFailure = createAction(
    "[Auth] Reset Password Failure",
    props<{ message: string; errors: ApiErrorDetail[] }>()
)

export const changePassword = createAction(
    "[Auth] Change Password",
    props<{ currentPassword: string; newPassword: string; confirmPassword: string }>()
)

export const changePasswordSuccess = createAction(
    "[Auth] Change Password Success"
)

export const changePasswordFailure = createAction(
    "[Auth] Change Password Failure",
    props<{ message: string; errors: ApiErrorDetail[] }>()
)