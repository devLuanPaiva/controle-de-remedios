import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideCalendarX } from '@lucide/angular';

import { UnityTypeLabels } from '@features/prescription/models/prescription-item.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { IAvailabilityList } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { formatDaysUntil } from '../../utils/dashboard-format.util';

const EMPTY_LIST: IAvailabilityList = { count: 0, items: [] };

@Component({
    selector: 'app-overdue-availability-widget',
    imports: [WidgetCard, StatTile, LucideCalendarX],
    templateUrl: './overdue-availability-widget.html',
    styleUrl: './overdue-availability-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverdueAvailabilityWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);
    readonly UnityTypeLabels = UnityTypeLabels;
    readonly formatDaysUntil = formatDaysUntil;

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getOverdueAvailability(params.companyId),
        defaultValue: EMPTY_LIST,
    });

    readonly list = this.resource.value;
    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar as entregas em atraso.') : null;
    });

    retry(): void {
        this.resource.reload();
    }
}
