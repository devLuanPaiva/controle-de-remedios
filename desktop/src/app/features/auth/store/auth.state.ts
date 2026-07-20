import { AuthUser } from "../models/auth-user.model";
import { ApiErrorDetail } from "@shared/models/api-error.model";

export interface AuthState {

    user: AuthUser | null;

    loading: boolean;

    authenticated: boolean;

    forgotPasswordLoading: boolean;

    forgotPasswordSubmitted: boolean;

    resetPasswordLoading: boolean;

    resetPasswordErrors: ApiErrorDetail[];

    changePasswordLoading: boolean;

    changePasswordErrors: ApiErrorDetail[];

    changePasswordSuccess: boolean;
}