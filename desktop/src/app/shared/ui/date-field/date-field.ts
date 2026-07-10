import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { Field } from '@shared/ui/field/field';

@Component({
    selector: 'app-date-field',
    imports: [Field],
    templateUrl: './date-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateField {
    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly field = input.required<FieldTree<string>>();
    readonly max = input<string>();

    onInput(rawValue: string): void {
        this.field()().value.set(rawValue);
    }

    markTouched(): void {
        this.field()().markAsTouched();
    }
}
