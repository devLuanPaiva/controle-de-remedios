import { apiFetch } from "@/lib/apiFetch";
import { SendChatMessageResult } from "@/data/models/assistant.model";

interface ChatResponseDto {
    conversationId: string;
    answer: string;
}

export async function sendAssistantMessage(
    companyId: string,
    message: string,
    conversationId: string,
): Promise<SendChatMessageResult> {
    const response = await apiFetch<ChatResponseDto>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ companyId, message, conversationId }),
    });

    return {
        conversationId: response.data.conversationId,
        answer: response.data.answer,
    };
}
