import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideLayoutGrid, LucideList } from '@lucide/angular';

export type ViewMode = 'cards' | 'table';

@Component({
    selector: 'app-view-toggle',
    imports: [LucideLayoutGrid, LucideList],
    templateUrl: './view-toggle.html',
    styleUrl: './view-toggle.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewToggle {
    readonly value = input.required<ViewMode>();
    readonly valueChange = output<ViewMode>();

    select(mode: ViewMode): void {
        if (mode !== this.value()) {
            this.valueChange.emit(mode);
        }
    }
}
