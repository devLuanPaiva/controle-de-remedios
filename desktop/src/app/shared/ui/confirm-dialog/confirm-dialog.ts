import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';

import { Modal } from '@shared/ui/modal/modal';

@Component({
    selector: 'app-confirm-dialog',
    imports: [Modal],
    templateUrl: './confirm-dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
    private readonly modalRef = viewChild.required<Modal>('modalRef');

    readonly titleId = input.required<string>();
    readonly titleText = input.required<string>();
    readonly message = input.required<string>();
    readonly confirmLabel = input('Confirmar');
    readonly confirmVariant = input<'primary' | 'danger'>('primary');

    readonly confirmed = output<void>();
    readonly closed = output<void>();

    onConfirm(): void {
        this.confirmed.emit();
        this.modalRef().requestClose();
    }

    onCancel(): void {
        this.modalRef().requestClose();
    }
}
