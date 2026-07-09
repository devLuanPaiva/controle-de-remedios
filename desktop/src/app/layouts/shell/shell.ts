import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import * as CompanyActions from '@features/company/store/company.actions';

import { Sidebar } from '../sidebar/sidebar';

@Component({
    selector: 'app-shell',
    imports: [RouterOutlet, Sidebar],
    templateUrl: './shell.html',
    styleUrl: './shell.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
    private readonly store = inject(Store);

    readonly sidebarOpen = signal(false);

    constructor() {
        this.store.dispatch(CompanyActions.loadCompanies());
    }

    toggleSidebar(): void {
        this.sidebarOpen.update((open) => !open);
    }

    closeSidebar(): void {
        this.sidebarOpen.set(false);
    }
}
