import { ActivityIndicator, FlatList, FlatListProps, StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/theme";

interface PaginatedListProps<T>
    extends Omit<
        FlatListProps<T>,
        "data" | "onEndReached" | "refreshing" | "onRefresh" | "ListFooterComponent" | "ListEmptyComponent"
    > {
    data: T[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    emptyMessage: string;
    onLoadMore: () => void;
    onRefresh: () => void;
}

export function PaginatedList<T>({
    data,
    isLoading,
    isLoadingMore,
    error,
    emptyMessage,
    onLoadMore,
    onRefresh,
    contentContainerStyle,
    ...flatListProps
}: Readonly<PaginatedListProps<T>>) {
    if (isLoading && data.length === 0) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error && data.length === 0) {
        return (
            <View style={styles.centerState}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            refreshing={isLoading}
            onRefresh={onRefresh}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
            ListFooterComponent={
                isLoadingMore ? <ActivityIndicator color={Colors.primary} style={styles.footerSpinner} /> : null
            }
            contentContainerStyle={[styles.content, data.length === 0 && styles.contentEmpty, contentContainerStyle]}
            {...flatListProps}
        />
    );
}

const styles = StyleSheet.create({
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.xl,
    },

    errorText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.base,
        color: Colors.danger,
        textAlign: "center",
    },

    emptyText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Spacing.xxl,
    },

    content: {
        padding: Spacing.xl,
        gap: Spacing.sm,
    },

    contentEmpty: {
        flexGrow: 1,
    },

    footerSpinner: {
        marginVertical: Spacing.lg,
    },
});
