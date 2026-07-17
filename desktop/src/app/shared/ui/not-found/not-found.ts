import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
    LucideBuilding2,
    LucideFileQuestion,
    LucideFileText,
    LucideHeartPulse,
    LucideInbox,
    LucidePill,
    LucideTruck,
    LucideUsers,
} from '@lucide/angular';

export type NotFoundIcon =
    | 'inbox'
    | 'page'
    | 'users'
    | 'patients'
    | 'prescriptions'
    | 'medicines'
    | 'deliveries'
    | 'company';

@Component({
    selector: 'app-not-found',
    imports: [
        LucideBuilding2,
        LucideFileQuestion,
        LucideFileText,
        LucideHeartPulse,
        LucideInbox,
        LucidePill,
        LucideTruck,
        LucideUsers,
    ],
    templateUrl: './not-found.html',
    styleUrl: './not-found.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
    readonly icon = input<NotFoundIcon>('inbox');
    readonly message = input.required<string>();
    readonly actionLabel = input<string>();

    readonly action = output<void>();
}
