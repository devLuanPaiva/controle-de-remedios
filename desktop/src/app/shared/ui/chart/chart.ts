import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    PLATFORM_ID,
    effect,
    inject,
    input,
    viewChild,
} from '@angular/core';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartConfiguration,
    ChartData,
    ChartOptions,
    ChartType,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';

Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Legend,
    Tooltip,
);

@Component({
    selector: 'app-chart',
    template: `<canvas #canvas [attr.aria-label]="ariaLabel()" role="img"></canvas>`,
    styleUrl: './chart.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
    readonly type = input.required<ChartType>();
    readonly data = input.required<ChartData>();
    readonly options = input<ChartOptions>();
    readonly ariaLabel = input('');

    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
    private readonly platformId = inject(PLATFORM_ID);

    private chart: Chart | null = null;
    private renderedType: ChartType | null = null;

    constructor() {
        effect(() => {
            const type = this.type();
            const data = this.data();
            const options = this.options() ?? {};

            if (!isPlatformBrowser(this.platformId)) {
                return;
            }

            if (this.chart && type !== this.renderedType) {
                this.chart.destroy();
                this.chart = null;
            }

            if (!this.chart) {
                this.createChart(type, data, options);
                return;
            }

            this.chart.data = data;
            this.chart.options = options;
            this.chart.update();
        });
    }

    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId) || this.chart) {
            return;
        }

        this.createChart(this.type(), this.data(), this.options() ?? {});
    }

    private createChart(type: ChartType, data: ChartData, options: ChartOptions): void {
        this.chart = new Chart(this.canvasRef().nativeElement, { type, data, options } as ChartConfiguration);
        this.renderedType = type;
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
        this.chart = null;
    }
}
