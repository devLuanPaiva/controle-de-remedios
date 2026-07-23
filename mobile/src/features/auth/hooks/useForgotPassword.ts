import { useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { forgotPassword } from "@/data/services/auth.service";

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
    "Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinição de senha.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formErrorField, setFormErrorField] = useState<string | undefined>(undefined);
    const [isSubmitted, setIsSubmitted] = useState(false);

    function validate(): string | null {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
            setFormErrorField("email");
            return "Informe um e-mail válido.";
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
            await forgotPassword(email.trim());
            setIsSubmitted(true);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setFormErrorField(err.field);
            } else {
                setFormError("Não foi possível enviar a solicitação.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return { email, setEmail, isSubmitting, formError, formErrorField, isSubmitted, submit };
}
