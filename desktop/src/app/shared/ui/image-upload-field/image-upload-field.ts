import { ChangeDetectionStrategy, Component, OnDestroy, computed, input, output, signal } from '@angular/core';
import { LucideCircleAlert, LucideImagePlus, LucidePencil } from '@lucide/angular';

@Component({
    selector: 'app-image-upload-field',
    imports: [LucideImagePlus, LucidePencil, LucideCircleAlert],
    templateUrl: './image-upload-field.html',
    styleUrl: './image-upload-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadField implements OnDestroy {
    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly initialImageUrl = input<string | undefined>(undefined);

    readonly inputId = computed(() => `${this.id()}-input`);

    readonly fileSelected = output<File>();

    private readonly localPreviewUrl = signal<string | null>(null);
    readonly previewUrl = computed(() => this.localPreviewUrl() ?? this.initialImageUrl() ?? null);

    readonly dragging = signal(false);
    readonly error = signal<string | null>(null);

    ngOnDestroy(): void {
        this.revokeLocalPreview();
    }

    onFileSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        this.handleFile(file);

        fileInput.value = '';
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.dragging.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.dragging.set(false);
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.dragging.set(false);

        this.handleFile(event.dataTransfer?.files?.[0]);
    }

    private handleFile(file: File | undefined): void {
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.error.set('Selecione um arquivo de imagem válido.');
            return;
        }

        this.error.set(null);
        this.revokeLocalPreview();
        this.localPreviewUrl.set(URL.createObjectURL(file));
        this.fileSelected.emit(file);
    }

    private revokeLocalPreview(): void {
        const current = this.localPreviewUrl();

        if (current) {
            URL.revokeObjectURL(current);
        }
    }
}
