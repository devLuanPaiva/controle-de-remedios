import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { LucideCircleAlert, LucideImagePlus, LucideX } from '@lucide/angular';

import { ToastService } from '@core/ui/toast/service/toast.service';
import { ToastType } from '@core/ui/toast/models/toast.model';
import { FileUploadService } from '@shared/services/file-upload.service';
import { UploadContext } from '@shared/models/presigned-upload.model';

@Component({
    selector: 'app-image-upload-multi-field',
    imports: [LucideImagePlus, LucideX, LucideCircleAlert],
    templateUrl: './image-upload-multi-field.html',
    styleUrl: './image-upload-multi-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadMultiField {
    private readonly fileUploadService = inject(FileUploadService);
    private readonly toastService = inject(ToastService);

    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly context = input.required<UploadContext>();
    readonly ownerName = input<string | undefined>(undefined);
    readonly imageUrls = input<string[]>([]);

    readonly imagesChanged = output<string[]>();

    readonly uploading = signal(false);
    readonly dragging = signal(false);
    readonly error = signal<string | null>(null);

    async onFilesSelected(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const files = Array.from(fileInput.files ?? []);

        await this.handleFiles(files);

        fileInput.value = '';
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();

        if (!this.uploading()) {
            this.dragging.set(true);
        }
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.dragging.set(false);
    }

    async onDrop(event: DragEvent): Promise<void> {
        event.preventDefault();
        this.dragging.set(false);

        await this.handleFiles(Array.from(event.dataTransfer?.files ?? []));
    }

    onRemove(index: number): void {
        this.imagesChanged.emit(this.imageUrls().filter((_, i) => i !== index));
    }

    private async handleFiles(files: File[]): Promise<void> {
        if (!files.length || this.uploading()) {
            return;
        }

        this.uploading.set(true);
        this.error.set(null);

        let current = [...this.imageUrls()];

        try {
            for (const file of files) {
                const url = await this.fileUploadService.uploadImage(file, this.context(), this.ownerName());
                current = [...current, url];
                this.imagesChanged.emit(current);
            }

            this.toastService.show(ToastType.Success, 'Imagens enviadas com sucesso.');
        } catch {
            this.error.set('Não foi possível enviar uma das imagens. Tente novamente.');
        } finally {
            this.uploading.set(false);
        }
    }
}
