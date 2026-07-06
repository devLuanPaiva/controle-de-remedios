
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    count: number | null;
    currentPage: number | null;
    totalPages: number | null;
    next: string | null;
    previous: string | null;
    data: T;
}
