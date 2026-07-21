import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideTrendingUp } from '@lucide/angular';
import { ChartData, ChartOptions } from 'chart.js';

import { ChartComponent } from '@shared/ui/chart/chart';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';
import { cssVar } from '@shared/utils/css-var.util';

import { DeliveryTimelineGranularity, IDeliveryTimeline } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { TIMELINE_SERIES_COLOR, TIMELINE_SERIES_FILL } from '../../utils/dashboard-colors.util';
import { formatShortDate } from '../../utils/dashboard-format.util';

const EMPTY_TIMELINE: IDeliveryTimeline = { granularity: DeliveryTimelineGranularity.DAY, points: [] };

@Component({
    selector: 'app-delivery-timeline-widget',
    imports: [WidgetCard, ChartComponent, LucideTrendingUp],
    templateUrl: './delivery-timeline-widget.html',
    styleUrl: './delivery-timeline-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryTimelineWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getDeliveryTimeline(params.companyId),
        defaultValue: EMPTY_TIMELINE,
    });

    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar a linha do tempo de entregas.') : null;
    });

    readonly totalDeliveries = computed(() =>
        this.resource.value().points.reduce((sum, point) => sum + point.deliveriesCount, 0),
    );

    readonly subtitle = computed(() => `${this.totalDeliveries()} entrega(s) nos últimos 30 dias`);

    readonly chartData = computed<ChartData>(() => {
        const points = this.resource.value().points;

        return {
            labels: points.map((point) => formatShortDate(point.periodStart)),
            datasets: [
                {
                    label: 'Entregas',
                    data: points.map((point) => point.deliveriesCount),
                    borderColor: TIMELINE_SERIES_COLOR,
                    backgroundColor: TIMELINE_SERIES_FILL,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: TIMELINE_SERIES_COLOR,
                    fill: true,
                    tension: 0.3,
                },
            ],
        };
    });

    readonly chartOptions = computed<ChartOptions>(() => {
        const points = this.resource.value().points;

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: cssVar('--color-primary-600', '#01402e'),
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            const point = points[context.dataIndex];
                            return [`${point.deliveriesCount} entrega(s)`, `${point.quantityTotal} unidade(s)`];
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: cssVar('--text-secondary', '#6b7280'), maxRotation: 0 },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: cssVar('--text-secondary', '#6b7280') },
                    grid: { color: cssVar('--color-neutral-300', '#d9d4cc') },
                },
            },
        };
    });

    retry(): void {
        this.resource.reload();
    }
}
