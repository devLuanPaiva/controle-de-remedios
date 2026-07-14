export type UploadContext = 'PROFILE' | 'PRESCRIPTION' | 'MEDICINE';

export interface PresignedUploadRequest {
    fileName: string;
    contentType: string;
    context: UploadContext;
    ownerName?: string;
}

export interface PresignedUploadResponse {
    uploadUrl: string;
    publicUrl: string;
    objectKey: string;
}
