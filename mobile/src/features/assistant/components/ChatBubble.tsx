import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/shared/Avatar";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { formatTimeBr } from "@/lib/dateFormat";
import { IChatMessage } from "@/data/models/assistant.model";
import { AssistantAvatar } from "./AssistantAvatar";

interface ChatBubbleProps {
    message: IChatMessage;
    userName: string;
    userImageUrl?: string | null;
}

export function ChatBubble({ message, userName, userImageUrl }: Readonly<ChatBubbleProps>) {
    const isUser = message.role === "user";

    return (
        <View style={[styles.row, isUser && styles.rowReversed]}>
            {isUser ? (
                <Avatar name={userName} imageUrl={userImageUrl} size="sm" />
            ) : (
                <AssistantAvatar />
            )}

            <View style={styles.bubbleColumn}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
                        {message.text}
                    </Text>
                </View>

                <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
                    {formatTimeBr(message.createdAt)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },

    rowReversed: {
        flexDirection: "row-reverse",
    },

    bubbleColumn: {
        maxWidth: "78%",
        gap: Spacing.xs,
    },

    bubble: {
        borderRadius: Radius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        ...Shadows.sm,
    },

    bubbleAssistant: {
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: Radius.sm,
    },

    bubbleUser: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: Radius.sm,
    },

    text: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        lineHeight: 20,
    },

    textAssistant: {
        color: Colors.text,
    },

    textUser: {
        color: Colors.white,
    },

    timestamp: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginLeft: Spacing.xs,
    },

    timestampUser: {
        marginLeft: 0,
        marginRight: Spacing.xs,
        textAlign: "right",
    },
});
