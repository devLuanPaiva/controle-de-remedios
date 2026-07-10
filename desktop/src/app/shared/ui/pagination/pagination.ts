import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.html',
    styleUrl: './pagination.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
    readonly pagination = input.required<PaginationInfo>();

    readonly previousPage = output<void>();
    readonly nextPage = output<void>();
}
