import { useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { requestDataDeletion } from "@/data/services/auth.service";

interface UseRequestDataDeletionOptions {
    onSuccess: () => void;
}

export function useRequestDataDeletion({ onSuccess }: UseRequestDataDeletionOptions) {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function reset() {
        setMessage("");
        setFormError(null);
    }

    async function submit() {
        try {
            setFormError(null);
            setIsSubmitting(true);
            await requestDataDeletion({ message: message.trim() || undefined });
            onSuccess();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
            } else {
                setFormError("Não foi possível enviar a solicitação.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        message,
        setMessage,
        isSubmitting,
        formError,
        submit,
        reset,
    };
}
