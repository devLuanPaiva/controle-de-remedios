import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, validate } from '@angular/forms/signals';
import { Store } from '@ngrx/store';

import { Field } from '@shared/ui/field/field';
import { CnpjField } from '@shared/ui/cnpj-field/cnpj-field';
import { Modal } from '@shared/ui/modal/modal';
import { isValidCnpj, onlyDigits } from '@shared/utils/cnpj.util';

import * as CompanyActions from '../../store/company.actions';
import { selectCompaniesMutating } from '../../store/company.selectors';

@Component({
    selector: 'app-company-create-modal',
    imports: [FormField, Field, CnpjField, Modal],
    templateUrl: './company-create-modal.html',
    styleUrl: './company-create-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCreateModal {
    private readonly store = inject(Store);

    readonly closed = output<void>();

    readonly mutating = this.store.selectSignal(selectCompaniesMutating);

    readonly model = signal({
        name: '',
        cnpj: '',
        imageUrl: '',
    });

    readonly companyForm = form(this.model, (schema) => {
        required(schema.name, { message: 'O nome é obrigatório.' });
        maxLength(schema.name, 120, { message: 'O nome deve ter no máximo 120 caracteres.' });

        required(schema.cnpj, { message: 'O CNPJ é obrigatório.' });
        validate(schema.cnpj, ({ value }) => (isValidCnpj(value()) ? null : { kind: 'cnpj', message: 'CNPJ inválido.' }));

        maxLength(schema.imageUrl, 255, { message: 'A URL da imagem deve ter no máximo 255 caracteres.' });
    });

    readonly canSubmit = computed(() => this.companyForm().valid() && !this.mutating());

    onSubmit(event: Event, modal: Modal): void {
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

        modal.requestClose();
    }
}
