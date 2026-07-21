import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideCalendarClock } from '@lucide/angular';

import { UnityTypeLabels } from '@features/prescription/models/prescription-item.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { IAvailabilityList } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { formatDaysUntil } from '../../utils/dashboard-format.util';

const EMPTY_LIST: IAvailabilityList = { count: 0, items: [] };
const UPCOMING_WINDOW_DAYS = 7;

@Component({
    selector: 'app-upcoming-availability-widget',
    imports: [WidgetCard, StatTile, LucideCalendarClock],
    templateUrl: './upcoming-availability-widget.html',
    styleUrl: './upcoming-availability-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingAvailabilityWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);
    readonly UnityTypeLabels = UnityTypeLabels;
    readonly formatDaysUntil = formatDaysUntil;

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getUpcomingAvailability(params.companyId, UPCOMING_WINDOW_DAYS),
        defaultValue: EMPTY_LIST,
    });

    readonly list = this.resource.value;
    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar as próximas liberações.') : null;
    });

    retry(): void {
        this.resource.reload();
    }
}
