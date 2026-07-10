import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TabConfig {
    id: string;
    label: string;
}

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.html',
    styleUrl: './tabs.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'tablist',
    },
})
export class Tabs {
    readonly tabs = input.required<TabConfig[]>();
    readonly activeTabId = input.required<string>();
    readonly tabChange = output<string>();

    selectTab(id: string): void {
        if (id !== this.activeTabId()) {
            this.tabChange.emit(id);
        }
    }
}
