import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
    selector: 'app-shell',
    imports: [RouterOutlet, Sidebar],
    templateUrl: './shell.html',
    styleUrl: './shell.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
    readonly sidebarOpen = signal(false);

    toggleSidebar(): void {
        this.sidebarOpen.update((open) => !open);
    }

    closeSidebar(): void {
        this.sidebarOpen.set(false);
    }
}
