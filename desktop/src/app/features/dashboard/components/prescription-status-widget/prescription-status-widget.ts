import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LucideListChecks } from '@lucide/angular';
import { ChartData, ChartOptions } from 'chart.js';

import { PrescriptionStatusLabels } from '@features/prescription/models/prescription.model';
import { ChartComponent } from '@shared/ui/chart/chart';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { extractErrorMessage } from '@shared/utils/api-error.util';
import { cssVar } from '@shared/utils/css-var.util';

import { IPrescriptionStatusBreakdown } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { PRESCRIPTION_STATUS_CHART_ORDER, PRESCRIPTION_STATUS_COLORS } from '../../utils/dashboard-colors.util';

const EMPTY_BREAKDOWN: IPrescriptionStatusBreakdown = { totalPrescriptions: 0, items: [] };

@Component({
    selector: 'app-prescription-status-widget',
    imports: [WidgetCard, ChartComponent, LucideListChecks],
    templateUrl: './prescription-status-widget.html',
    styleUrl: './prescription-status-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionStatusWidget {
    private readonly dashboardService = inject(DashboardService);

    readonly companyId = input<string | null>(null);

    private readonly resource = rxResource({
        params: () => (this.companyId() ? { companyId: this.companyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getPrescriptionStatusBreakdown(params.companyId),
        defaultValue: EMPTY_BREAKDOWN,
    });

    readonly loading = this.resource.isLoading;

    readonly errorMessage = computed(() => {
        const error = this.resource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar status das receitas.') : null;
    });

    readonly subtitle = computed(() => {
        const total = this.resource.value().totalPrescriptions;
        return `${total} receita${total === 1 ? '' : 's'} no total`;
    });

    readonly rows = computed(() => {
        const countByStatus = new Map(this.resource.value().items.map((item) => [item.status, item.count]));

        return PRESCRIPTION_STATUS_CHART_ORDER.map((status) => ({
            status,
            label: PrescriptionStatusLabels[status],
            count: countByStatus.get(status) ?? 0,
            color: PRESCRIPTION_STATUS_COLORS[status],
        }));
    });

    readonly chartData = computed<ChartData>(() => {
        const rows = this.rows();

        return {
            labels: rows.map((row) => row.label),
            datasets: [
                {
                    data: rows.map((row) => row.count),
                    backgroundColor: rows.map((row) => row.color),
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
                    label: (context) => `${context.parsed.x} receita(s)`,
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
