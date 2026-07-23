import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideCircleCheck } from '@lucide/angular';
import { ChartData, ChartOptions } from 'chart.js';

import { ChartComponent } from '@shared/ui/chart/chart';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';
import { cssVar } from '@shared/utils/css-var.util';

import { IFulfillmentSummary } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { FULFILLMENT_DELIVERED_COLOR, FULFILLMENT_PARTIAL_COLOR } from '../../utils/dashboard-colors.util';
import { formatPercent } from '../../utils/dashboard-format.util';

const EMPTY_SUMMARY: IFulfillmentSummary = {
    deliveredCount: 0,
    partialCount: 0,
    totalCount: 0,
    completionRate: null,
    prescribedQuantityTotal: 0,
    deliveredQuantityTotal: 0,
    coverageRate: null,
};

@Component({
    selector: 'app-fulfillment-summary-widget',
    imports: [WidgetCard, StatTile, ChartComponent, LucideCircleCheck],
    templateUrl: './fulfillment-summary-widget.html',
    styleUrl: './fulfillment-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FulfillmentSummaryWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getFulfillmentSummary(params.companyId),
        defaultValue: EMPTY_SUMMARY,
    });

    readonly summary = this.resource.value;
    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar o resumo de atendimento.') : null;
    });

    readonly completionRateLabel = computed(() => formatPercent(this.summary().completionRate));
    readonly coverageRateLabel = computed(() => formatPercent(this.summary().coverageRate));

    readonly chartData = computed<ChartData>(() => {
        const summary = this.summary();

        return {
            labels: ['Entrega completa', 'Entrega parcial'],
            datasets: [
                {
                    data: [summary.deliveredCount, summary.partialCount],
                    backgroundColor: [FULFILLMENT_DELIVERED_COLOR, FULFILLMENT_PARTIAL_COLOR],
                    borderRadius: 4,
                    barThickness: 20,
                },
            ],
        };
    });

    readonly chartOptions: ChartOptions = {
        indexAxis: 'y',
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
                    label: (context) => `${context.parsed.x} item(ns)`,
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { precision: 0, color: cssVar('--text-secondary', '#6b7280') },
                grid: { color: cssVar('--color-neutral-300', '#d9d4cc') },
            },
            y: {
                ticks: { color: cssVar('--text-primary', '#1f2937') },
                grid: { display: false },
            },
        },
    };

    retry(): void {
        this.resource.reload();
    }
}
