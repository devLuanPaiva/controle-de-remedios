import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideHourglass } from '@lucide/angular';

import { UnityTypeLabels } from '@features/prescription/models/prescription-item.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { IDeliveryQueueSummary } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { formatDays } from '../../utils/dashboard-format.util';

const EMPTY_SUMMARY: IDeliveryQueueSummary = { pendingCount: 0, averageWaitDays: null, oldestPending: [] };

@Component({
    selector: 'app-delivery-queue-widget',
    imports: [WidgetCard, StatTile, LucideHourglass],
    templateUrl: './delivery-queue-widget.html',
    styleUrl: './delivery-queue-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryQueueWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);
    readonly UnityTypeLabels = UnityTypeLabels;

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getQueueSummary(params.companyId),
        defaultValue: EMPTY_SUMMARY,
    });

    readonly summary = this.resource.value;
    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar a fila de entregas.') : null;
    });

    readonly averageWaitLabel = computed(() => formatDays(this.summary().averageWaitDays));

    retry(): void {
        this.resource.reload();
    }
}
