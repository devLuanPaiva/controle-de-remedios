import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTileAccent = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
    selector: 'app-stat-tile',
    templateUrl: './stat-tile.html',
    styleUrl: './stat-tile.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatTile {
    readonly label = input.required<string>();
    readonly value = input.required<string>();
    readonly hint = input<string | null>(null);
    readonly accent = input<StatTileAccent>('neutral');
}
