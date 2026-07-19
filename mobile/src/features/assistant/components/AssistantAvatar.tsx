import { Bot } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Colors, Radius } from "@/theme";

export function AssistantAvatar() {
    return (
        <View style={styles.badge}>
            <Bot size={18} color={Colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
    },
});
