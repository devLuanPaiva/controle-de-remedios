import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';

import { Field } from '@shared/ui/field/field';
import { Modal } from '@shared/ui/modal/modal';

@Component({
    selector: 'app-deliver-quantity-modal',
    imports: [Field, Modal],
    templateUrl: './deliver-quantity-modal.html',
    styleUrl: './deliver-quantity-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliverQuantityModal {
    private readonly modalRef = viewChild.required<Modal>('modalRef');

    readonly medicineName = input.required<string>();
    readonly mutating = input(false);

    readonly quantitySubmitted = output<number>();
    readonly closed = output<void>();

    readonly quantity = signal<number | null>(null);
    readonly touched = signal(false);

    readonly invalid = computed(() => {
        const value = this.quantity();
        return value === null || value <= 0;
    });

    readonly canSubmit = computed(() => !this.invalid() && !this.mutating());

    onQuantityChange(rawValue: string): void {
        this.quantity.set(rawValue === '' ? null : Number(rawValue));
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        this.touched.set(true);

        if (!this.canSubmit()) {
            return;
        }

        this.quantitySubmitted.emit(this.quantity()!);
        this.modalRef().requestClose();
    }

    requestClose(): void {
        this.modalRef().requestClose();
    }
}
