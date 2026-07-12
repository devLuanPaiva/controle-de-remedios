import { FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface UploadedImagesRowProps {
    imageUrls: string[];
}

function renderImage({ item }: { item: string }) {
    return <Image source={{ uri: item }} style={styles.thumbnail} contentFit="cover" />;
}

export function UploadedImagesRow({ imageUrls }: Readonly<UploadedImagesRowProps>) {
    if (imageUrls.length === 0) {
        return null;
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
});
