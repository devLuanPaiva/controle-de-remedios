import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface UploadedImagesRowProps {
    imageUrls: string[];
}

export function UploadedImagesRow({ imageUrls }: Readonly<UploadedImagesRowProps>) {
    const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

    if (imageUrls.length === 0) {
        return null;
    }

    function renderImage({ item }: { item: string }) {
        return (
            <TouchableOpacity
                onPress={() => setExpandedUrl(item)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ampliar imagem"
            >
                <Image source={{ uri: item }} style={styles.thumbnail} contentFit="cover" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Imagens enviadas</Text>

            <FlatList
                horizontal
                data={imageUrls}
                keyExtractor={(item) => item}
                renderItem={renderImage}
                contentContainerStyle={styles.list}
                showsHorizontalScrollIndicator={false}
            />

            <Modal
                visible={Boolean(expandedUrl)}
                transparent
                animationType="fade"
                onRequestClose={() => setExpandedUrl(null)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setExpandedUrl(null)}
                    accessibilityLabel="Fechar imagem ampliada"
                >
                    {expandedUrl ? (
                        <Image source={{ uri: expandedUrl }} style={styles.expandedImage} contentFit="contain" />
                    ) : null}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setExpandedUrl(null)}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar"
                    >
                        <X size={20} color={Colors.white} />
                    </TouchableOpacity>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    list: {
        gap: Spacing.sm,
    },

    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    backdrop: {
        flex: 1,
        backgroundColor: "rgba(26,26,26,0.92)",
        alignItems: "center",
        justifyContent: "center",
    },

    expandedImage: {
        width: "92%",
        height: "80%",
    },

    closeButton: {
        position: "absolute",
        top: Spacing.xxl,
        right: Spacing.xl,
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.16)",
    },
});
