import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { Field } from '@shared/ui/field/field';
import { formatCpf } from '@shared/utils/cpf.util';

@Component({
    selector: 'app-cpf-field',
    imports: [Field],
    templateUrl: './cpf-field.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpfField {
    readonly id = input.required<string>();
    readonly label = input('CPF');
    readonly field = input.required<FieldTree<string>>();

    onInput(rawValue: string): void {
        this.field()().value.set(formatCpf(rawValue));
    }

    markTouched(): void {
        this.field()().markAsTouched();
    }
}
