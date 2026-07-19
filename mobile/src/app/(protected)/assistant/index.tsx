import { useCallback, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, Bot } from "lucide-react-native";

import { useAuth } from "@/data/contexts/AuthContext";
import { useCompanies } from "@/data/contexts/CompanyContext";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { BackButton } from "@/components/shared/BackButton";
import { useAssistantChat } from "@/features/assistant/hooks/useAssistantChat";
import { ChatBubble } from "@/features/assistant/components/ChatBubble";
import { TypingIndicator } from "@/features/assistant/components/TypingIndicator";
import { ChatInputBar } from "@/features/assistant/components/ChatInputBar";
import { IChatMessage } from "@/data/models/assistant.model";

export default function AssistantScreen() {
    const { user } = useAuth();
    const { selectedCompany } = useCompanies();
    const { messages, isSending, error, sendMessage } = useAssistantChat(selectedCompany?.id);
    const [draft, setDraft] = useState("");
    const listRef = useRef<FlatList<IChatMessage>>(null);

    function handleSend() {
        const text = draft;
        setDraft("");
        sendMessage(text);
    }

    const renderItem = useCallback(
        ({ item }: { item: IChatMessage }) => (
            <ChatBubble message={item} userName={user?.name ?? "Você"} userImageUrl={user?.imageUrl} />
        ),
        [user?.name, user?.imageUrl],
    );

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.header}>
                    <BackButton />

                    <View style={styles.headerIcon}>
                        <Bot size={18} color={Colors.primary} />
                    </View>

                    <Text style={styles.title}>Assistente IA</Text>
                </View>

                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={isSending ? <TypingIndicator /> : null}
                />

                {error ? (
                    <View style={styles.errorBox}>
                        <AlertCircle size={16} color={Colors.danger} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <ChatInputBar value={draft} onChangeText={setDraft} onSend={handleSend} isSending={isSending} />
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },

    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    list: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        backgroundColor: `${Colors.danger}1A`,
        borderWidth: 1,
        borderColor: `${Colors.danger}40`,
        borderRadius: Radius.lg,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },

    errorText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },
});
