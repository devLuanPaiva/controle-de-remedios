import { StyleSheet, Text, View } from "react-native";
import { Info, Sparkles } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { ExtractionResult } from "@/data/services/gemini.service";

interface ExtractionBannerProps {
    extraction: ExtractionResult | null;
}

export function ExtractionBanner({ extraction }: Readonly<ExtractionBannerProps>) {
    if (!extraction) {
        return null;
    }

    const isSuccess = extraction.status === "success";

    return (
        <View style={[styles.banner, isSuccess ? styles.bannerSuccess : styles.bannerInfo]}>
            {isSuccess ? (
                <Sparkles size={18} color={Colors.primary} />
            ) : (
                <Info size={18} color={Colors.info} />
            )}

            <Text style={[styles.text, isSuccess ? styles.textSuccess : styles.textInfo]}>
                {isSuccess
                    ? "Dados preenchidos automaticamente pela IA. Confira antes de enviar."
                    : "Não foi possível identificar os dados automaticamente. Preencha manualmente."}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
    },

    bannerSuccess: {
        backgroundColor: `${Colors.primary}14`,
        borderColor: `${Colors.primary}33`,
    },

    bannerInfo: {
        backgroundColor: `${Colors.info}14`,
        borderColor: `${Colors.info}33`,
    },

    text: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        lineHeight: 18,
    },

    textSuccess: {
        color: Colors.primaryDark,
    },

    textInfo: {
        color: Colors.text,
    },
});
