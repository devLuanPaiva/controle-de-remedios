import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'app-danger-card',
    templateUrl: './danger-card.html',
    styleUrl: './danger-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DangerCard {
    readonly title = input.required<string>();
    readonly subtitle = input.required<string>();
    readonly actionLabel = input.required<string>();
    readonly actionVariant = input<'outline' | 'danger'>('danger');

    readonly action = output<void>();
}
