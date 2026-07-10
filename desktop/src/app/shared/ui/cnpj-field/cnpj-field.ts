import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { Field } from '@shared/ui/field/field';
import { formatCnpj } from '@shared/utils/cnpj.util';

@Component({
    selector: 'app-cnpj-field',
    imports: [Field],
    templateUrl: './cnpj-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CnpjField {
    readonly id = input.required<string>();
    readonly label = input('CNPJ');
    readonly field = input.required<FieldTree<string>>();

    onInput(rawValue: string): void {
        this.field()().value.set(formatCnpj(rawValue));
    }

    markTouched(): void {
        this.field()().markAsTouched();
    }
}
