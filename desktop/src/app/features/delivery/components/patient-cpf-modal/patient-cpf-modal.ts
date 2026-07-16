import { ChangeDetectionStrategy, Component, computed, output, signal, viewChild } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';

import { CpfField } from '@shared/ui/cpf-field/cpf-field';
import { Modal } from '@shared/ui/modal/modal';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf.util';

@Component({
    selector: 'app-patient-cpf-modal',
    imports: [CpfField, Modal],
    templateUrl: './patient-cpf-modal.html',
    styleUrl: './patient-cpf-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientCpfModal {
    private readonly modalRef = viewChild.required<Modal>('modalRef');

    readonly cpfSubmitted = output<string>();
    readonly closed = output<void>();

    readonly model = signal({ cpf: '' });

    readonly cpfForm = form(this.model, (schema) => {
        required(schema.cpf, { message: 'O CPF é obrigatório.' });
        validate(schema.cpf, ({ value }) => (isValidCpf(value()) ? null : { kind: 'cpf', message: 'CPF inválido.' }));
    });

    readonly canSubmit = computed(() => this.cpfForm().valid());

    onSubmit(event: Event): void {
        event.preventDefault();

        if (!this.canSubmit()) {
            this.cpfForm().markAsTouched();
            return;
        }

        this.cpfSubmitted.emit(onlyDigits(this.model().cpf));
        this.modalRef().requestClose();
    }

    requestClose(): void {
        this.modalRef().requestClose();
    }
}
