export interface PagedResult<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
}
