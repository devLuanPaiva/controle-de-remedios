export type ChatMessageRole = "user" | "assistant";

export interface IChatMessage {
    id: string;
    role: ChatMessageRole;
    text: string;
    createdAt: Date;
}

export interface SendChatMessageResult {
    conversationId: string;
    answer: string;
}
