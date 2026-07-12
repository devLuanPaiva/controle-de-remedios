import { ApiSuccessResponse } from "./apiFetch";

export async function fetchAllPages<TDto, TDomain>(
    requestPage: (page: number) => Promise<ApiSuccessResponse<TDto[]>>,
    mapItem: (dto: TDto) => TDomain,
): Promise<TDomain[]> {
    const items: TDomain[] = [];
    let page = 0;
    let totalPages = 1;

    do {
        const response = await requestPage(page);
        items.push(...response.data.map(mapItem));
        totalPages = response.totalPages ?? 1;
        page = response.currentPage ?? totalPages;
    } while (page < totalPages);

    return items;
}
