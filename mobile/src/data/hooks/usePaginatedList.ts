import { useCallback, useEffect, useRef, useState } from "react";

import { PagedResult } from "@/lib/pagination";

export interface UsePaginatedListResult<T> {
    items: T[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
}

export function usePaginatedList<T>(fetchPage: (page: number) => Promise<PagedResult<T>>): UsePaginatedListResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPageRef = useRef(fetchPage);
    fetchPageRef.current = fetchPage;

    const load = useCallback(async (targetPage: number, append: boolean) => {
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            setError(null);

            const result = await fetchPageRef.current(targetPage);

            setItems((current) => (append ? [...current, ...result.data] : result.data));
            setPage(result.currentPage);
            setTotalPages(result.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar a lista.");
        } finally {
            if (append) {
                setIsLoadingMore(false);
            } else {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        load(0, false);
    }, [fetchPage, load]);

    const loadMore = useCallback(() => {
        if (isLoadingMore || isLoading || page + 1 >= totalPages) {
            return;
        }

        load(page + 1, true);
    }, [isLoading, isLoadingMore, load, page, totalPages]);

    const refresh = useCallback(() => {
        load(0, false);
    }, [load]);

    return {
        items,
        isLoading,
        isLoadingMore,
        error,
        hasMore: page + 1 < totalPages,
        loadMore,
        refresh,
    };
}
