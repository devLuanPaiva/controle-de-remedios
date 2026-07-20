import { apiFetch } from "@/lib/apiFetch";
import {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "@/data/models/auth.model";

export async function forgotPassword(email: string): Promise<void> {
    const payload: ForgotPasswordRequest = { email, context: "MOBILE" };

    await apiFetch<null>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await apiFetch<null>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
    await apiFetch<null>("/users/change-password", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
