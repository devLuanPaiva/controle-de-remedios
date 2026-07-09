import { EMPTY, expand, Observable, reduce } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';

export function fetchAllPages<TDto, TDomain>(
    requestPage: (page: number) => Observable<ApiResponse<TDto[]>>,
    mapItem: (dto: TDto) => TDomain,
): Observable<TDomain[]> {
    return requestPage(0).pipe(
        expand((response) => {
            const currentPage = response.currentPage ?? 1;
            const totalPages = response.totalPages ?? 1;

            return currentPage < totalPages ? requestPage(currentPage) : EMPTY;
        }),
        reduce((items, response) => [...items, ...response.data.map(mapItem)], [] as TDomain[]),
    );
}
