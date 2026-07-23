import { useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { changePassword } from "@/data/services/auth.service";

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

interface UseChangePasswordOptions {
    onSuccess: () => void;
}

export function useChangePassword({ onSuccess }: UseChangePasswordOptions) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formErrorField, setFormErrorField] = useState<string | undefined>(undefined);

    function validate(): string | null {
        if (!currentPassword) {
            setFormErrorField("currentPassword");
            return "Informe sua senha atual.";
        }

        if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
            setFormErrorField("newPassword");
            return "A nova senha deve ter entre 6 e 20 caracteres.";
        }

        if (newPassword !== confirmPassword) {
            setFormErrorField("confirmPassword");
            return "As senhas não coincidem.";
        }

        setFormErrorField(undefined);
        return null;
    }

    async function submit() {
        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setFormError(null);
            setIsSubmitting(true);
            await changePassword({ currentPassword, newPassword, confirmPassword });
            onSuccess();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setFormErrorField(err.field);
            } else {
                setFormError("Não foi possível alterar a senha.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        isSubmitting,
        formError,
        formErrorField,
        submit,
    };
}
