import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';
import { PresignedUploadRequest, PresignedUploadResponse, UploadContext } from '@shared/models/presigned-upload.model';

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    async uploadImage(file: File, context: UploadContext, ownerName?: string): Promise<string> {
        const payload: PresignedUploadRequest = {
            fileName: file.name,
            contentType: file.type,
            context,
            ownerName,
        };

        const presigned = await firstValueFrom(
            this.http.post<ApiResponse<PresignedUploadResponse>>(`${this.apiUrl()}/uploads/presigned-url`, payload),
        );

        const { uploadUrl, publicUrl } = presigned.data;

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });

        if (!uploadResponse.ok) {
            throw new Error('Falha ao enviar a imagem.');
        }

        return publicUrl;
    }
}
