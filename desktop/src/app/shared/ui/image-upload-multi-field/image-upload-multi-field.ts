import { ChangeDetectionStrategy, Component, OnDestroy, effect, input, output, signal } from '@angular/core';
import { LucideCircleAlert, LucideImagePlus, LucideX } from '@lucide/angular';

export interface ImageUploadMultiFieldChange {
    keptUrls: string[];
    newFiles: File[];
}

interface LocalImage {
    file: File;
    previewUrl: string;
}

@Component({
    selector: 'app-image-upload-multi-field',
    imports: [LucideImagePlus, LucideX, LucideCircleAlert],
    templateUrl: './image-upload-multi-field.html',
    styleUrl: './image-upload-multi-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadMultiField implements OnDestroy {
    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly initialImageUrls = input<string[]>([]);

    readonly imagesChanged = output<ImageUploadMultiFieldChange>();

    readonly keptUrls = signal<string[]>([]);
    readonly newImages = signal<LocalImage[]>([]);

    readonly dragging = signal(false);
    readonly error = signal<string | null>(null);

    constructor() {
        effect(() => {
            this.keptUrls.set(this.initialImageUrls());
        });
    }

    ngOnDestroy(): void {
        this.newImages().forEach((image) => URL.revokeObjectURL(image.previewUrl));
    }

    onFilesSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const files = Array.from(fileInput.files ?? []);

        this.handleFiles(files);

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

        this.handleFiles(Array.from(event.dataTransfer?.files ?? []));
    }

    onRemoveKept(index: number): void {
        this.keptUrls.update((current) => current.filter((_, i) => i !== index));
        this.emitChange();
    }

    onRemoveNew(index: number): void {
        this.newImages.update((current) => {
            const removed = current[index];

            if (removed) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            return current.filter((_, i) => i !== index);
        });

        this.emitChange();
    }

    private handleFiles(files: File[]): void {
        if (!files.length) {
            return;
        }

        const validFiles = files.filter((file) => file.type.startsWith('image/'));

        this.error.set(validFiles.length === files.length ? null : 'Selecione apenas arquivos de imagem.');

        if (!validFiles.length) {
            return;
        }

        const localImages = validFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));

        this.newImages.update((current) => [...current, ...localImages]);
        this.emitChange();
    }

    private emitChange(): void {
        this.imagesChanged.emit({
            keptUrls: this.keptUrls(),
            newFiles: this.newImages().map((image) => image.file),
        });
    }
}
