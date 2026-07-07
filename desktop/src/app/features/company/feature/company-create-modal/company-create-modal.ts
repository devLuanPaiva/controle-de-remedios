import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, output, signal, viewChild } from '@angular/core';
import { FormField, form, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { formatCnpj, isValidCnpj, onlyDigits } from '@shared/utils/cnpj.util';

import * as CompanyActions from '../../store/company.actions';
import { selectCompaniesMutating } from '../../store/company.selectors';

@Component({
    selector: 'app-company-create-modal',
    imports: [FormField],
    templateUrl: './company-create-modal.html',
    styleUrl: './company-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCreateModal {
    private readonly store = inject(Store);

    private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

    readonly closed = output<void>();

    readonly mutating = this.store.selectSignal(selectCompaniesMutating);

    readonly model = signal({
        name: '',
        cnpj: '',
        imageUrl: '',
    });

    readonly companyForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });

        required(schema.cnpj, { message: 'O CNPJ é obrigatório.' });
        validate(schema.cnpj, ({ value }) => (isValidCnpj(value()) ? null : { kind: 'cnpj', message: 'CNPJ inválido.' }));
    });

    readonly canSubmit = computed(() => this.companyForm().valid() && !this.mutating());

    constructor() {
        afterNextRender(() => {
            this.dialogRef().nativeElement.showModal();
        });
    }

    onCnpjInput(rawValue: string): void {
        this.model.update((current) => ({ ...current, cnpj: formatCnpj(rawValue) }));
    }

    requestClose(): void {
        this.dialogRef().nativeElement.close();
    }

    onDialogClick(event: MouseEvent): void {
        if (event.target === this.dialogRef().nativeElement) {
            this.requestClose();
        }
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.companyForm().markAsTouched();
            return;
        }

        const value = this.model();

        this.store.dispatch(
            CompanyActions.createCompany({
                payload: {
                    name: value.name,
                    cnpj: onlyDigits(value.cnpj),
                    imageUrl: value.imageUrl || undefined,
                },
            }),
        );

        this.requestClose();
    }
}
