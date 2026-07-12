import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { LucideCircleAlert, LucideImagePlus, LucidePencil } from '@lucide/angular';

import { ToastService } from '@core/ui/toast/service/toast.service';
import { ToastType } from '@core/ui/toast/models/toast.model';
import { FileUploadService } from '@shared/services/file-upload.service';
import { UploadContext } from '@shared/models/presigned-upload.model';

@Component({
    selector: 'app-image-upload-field',
    imports: [LucideImagePlus, LucidePencil, LucideCircleAlert],
    templateUrl: './image-upload-field.html',
    styleUrl: './image-upload-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadField {
    private readonly fileUploadService = inject(FileUploadService);
    private readonly toastService = inject(ToastService);

    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly context = input.required<UploadContext>();
    readonly ownerName = input<string | undefined>(undefined);
    readonly imageUrl = input<string | undefined>(undefined);

    readonly inputId = computed(() => `${this.id()}-input`);

    readonly uploaded = output<string>();

    readonly uploading = signal(false);
    readonly dragging = signal(false);
    readonly error = signal<string | null>(null);

    async onFileSelected(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        await this.handleFile(file);

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

        await this.handleFile(event.dataTransfer?.files?.[0]);
    }

    private async handleFile(file: File | undefined): Promise<void> {
        if (!file || this.uploading()) {
            return;
        }

        this.uploading.set(true);
        this.error.set(null);

        try {
            const url = await this.fileUploadService.uploadImage(file, this.context(), this.ownerName());
            this.uploaded.emit(url);
            this.toastService.show(ToastType.Success, 'Imagem enviada com sucesso.');
        } catch {
            this.error.set('Não foi possível enviar a imagem. Tente novamente.');
        } finally {
            this.uploading.set(false);
        }
    }
}
