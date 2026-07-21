import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideTriangleAlert } from '@lucide/angular';

@Component({
    selector: 'app-widget-card',
    imports: [LucideTriangleAlert],
    templateUrl: './widget-card.html',
    styleUrl: './widget-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetCard {
    readonly title = input.required<string>();
    readonly subtitle = input<string | null>(null);
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly retry = output<void>();
}
