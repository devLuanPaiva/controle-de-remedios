export interface ForgotPasswordRequest {
    email: string;
    context: "MOBILE";
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface DeleteAccountRequest {
    password: string;
}
