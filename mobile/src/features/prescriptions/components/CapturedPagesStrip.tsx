import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";

import { Colors, Radius, Spacing } from "@/theme";
import { CapturedPage } from "@/data/contexts/PrescriptionScanContext";

interface CapturedPagesStripProps {
    pages: CapturedPage[];
    onRemove: (id: string) => void;
}

export function CapturedPagesStrip({ pages, onRemove }: Readonly<CapturedPagesStripProps>) {
    if (pages.length === 0) {
        return null;
    }

    function renderPage({ item }: { item: CapturedPage }) {
        return (
            <View style={styles.thumbnailWrapper}>
                <Image source={{ uri: item.localUri }} style={styles.thumbnail} contentFit="cover" />

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemove(item.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remover página"
                >
                    <X size={12} color={Colors.white} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            horizontal
            data={pages}
            keyExtractor={(item) => item.id}
            renderItem={renderPage}
            contentContainerStyle={styles.list}
            showsHorizontalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
    },

    thumbnailWrapper: {
        width: 64,
        height: 64,
        borderRadius: Radius.lg,
        overflow: "visible",
    },

    thumbnail: {
        width: "100%",
        height: "100%",
        borderRadius: Radius.lg,
        borderWidth: 2,
        borderColor: Colors.white,
    },

    removeButton: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(26,26,26,0.85)",
    },
});
