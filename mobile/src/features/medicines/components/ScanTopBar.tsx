import { StyleSheet, View } from "react-native";

import { Spacing } from "@/theme";
import { BackButton } from "@/components/shared/BackButton";
import { SpeechTipButton } from "@/components/shared/SpeechTipButton";

interface ScanTopBarProps {
    isSpeaking: boolean;
    onSpeakPress: () => void;
    onBackPress?: () => void;
}

export function ScanTopBar({ isSpeaking, onSpeakPress, onBackPress }: Readonly<ScanTopBarProps>) {
    return (
        <View style={styles.topBar}>
            <BackButton variant="onDark" onPress={onBackPress} />
            <SpeechTipButton isSpeaking={isSpeaking} onPress={onSpeakPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },
});
