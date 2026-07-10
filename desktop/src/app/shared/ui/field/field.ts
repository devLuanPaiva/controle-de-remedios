import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-field',
    templateUrl: './field.html',
    styleUrl: './field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Field {
    readonly for = input.required<string>();
    readonly label = input.required<string>();
    readonly touched = input(false);
    readonly invalid = input(false);
    readonly errorMessage = input<string | undefined>(undefined);
}
