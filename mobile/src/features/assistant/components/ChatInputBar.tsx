import { SendHorizontal } from "lucide-react-native";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface ChatInputBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isSending: boolean;
}

export function ChatInputBar({ value, onChangeText, onSend, isSending }: Readonly<ChatInputBarProps>) {
    const canSend = value.trim().length > 0 && !isSending;

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Pergunte sobre entregas ou pacientes..."
                placeholderTextColor={Colors.textSecondary}
                value={value}
                onChangeText={onChangeText}
                multiline
                maxLength={2000}
                editable={!isSending}
                accessibilityLabel="Mensagem para o assistente"
            />

            <TouchableOpacity
                style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                onPress={onSend}
                disabled={!canSend}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensagem"
            >
                <SendHorizontal size={20} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },

    input: {
        flex: 1,
        maxHeight: 120,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.xl,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    sendButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    sendButtonDisabled: {
        opacity: 0.5,
    },
});
