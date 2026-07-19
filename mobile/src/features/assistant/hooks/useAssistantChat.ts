import { useCallback, useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { generateUuid } from "@/lib/uuid";
import { sendAssistantMessage } from "@/data/services/assistant.service";
import { IChatMessage } from "@/data/models/assistant.model";

function createWelcomeMessage(): IChatMessage {
    return {
        id: generateUuid(),
        role: "assistant",
        text: "Olá! Sou o assistente de entregas. Pergunte sobre entregas pendentes, recentes ou de um paciente específico.",
        createdAt: new Date(),
    };
}

export function useAssistantChat(companyId: string | undefined) {
    const [messages, setMessages] = useState<IChatMessage[]>(() => [createWelcomeMessage()]);
    const [conversationId] = useState<string>(generateUuid);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmedText = text.trim();

            if (!trimmedText || !companyId) {
                return;
            }

            const userMessage: IChatMessage = {
                id: generateUuid(),
                role: "user",
                text: trimmedText,
                createdAt: new Date(),
            };

            setMessages((previous) => [...previous, userMessage]);
            setError(null);
            setIsSending(true);

            try {
                const result = await sendAssistantMessage(companyId, trimmedText, conversationId);

                const assistantMessage: IChatMessage = {
                    id: generateUuid(),
                    role: "assistant",
                    text: result.answer,
                    createdAt: new Date(),
                };

                setMessages((previous) => [...previous, assistantMessage]);
            } catch (err) {
                setError(err instanceof ApiRequestError ? err.message : "Não foi possível falar com o assistente.");
            } finally {
                setIsSending(false);
            }
        },
        [companyId, conversationId],
    );

    return { messages, isSending, error, sendMessage };
}
