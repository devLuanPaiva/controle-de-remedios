import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';

import { FileUploadService } from '@shared/services/file-upload.service';

@Component({
    selector: 'app-image-upload-field',
    templateUrl: './image-upload-field.html',
    styleUrl: './image-upload-field.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadField {
    private readonly fileUploadService = inject(FileUploadService);

    readonly id = input.required<string>();
    readonly label = input.required<string>();
    readonly imageUrl = input<string | undefined>(undefined);

    readonly uploaded = output<string>();

    readonly uploading = signal(false);
    readonly error = signal<string | null>(null);

    async onFileSelected(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file) {
            return;
        }

        this.uploading.set(true);
        this.error.set(null);

        try {
            const url = await this.fileUploadService.uploadImage(file);
            this.uploaded.emit(url);
        } catch {
            this.error.set('Não foi possível enviar a imagem. Tente novamente.');
        } finally {
            this.uploading.set(false);
            fileInput.value = '';
        }
    }
}
