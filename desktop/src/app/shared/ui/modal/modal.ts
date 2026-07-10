import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.html',
    styleUrl: './modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
    private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

    readonly titleId = input.required<string>();
    readonly titleText = input.required<string>();
    readonly panelClass = input('');

    readonly closed = output<void>();

    constructor() {
        afterNextRender(() => {
            this.dialogRef().nativeElement.showModal();
        });
    }

    requestClose(): void {
        this.dialogRef().nativeElement.close();
    }

    onDialogClick(event: MouseEvent): void {
        if (event.target === this.dialogRef().nativeElement) {
            this.requestClose();
        }
    }
}
