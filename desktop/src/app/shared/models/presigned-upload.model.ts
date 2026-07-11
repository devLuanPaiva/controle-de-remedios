export interface PresignedUploadRequest {
    fileName: string;
    contentType: string;
}

export interface PresignedUploadResponse {
    uploadUrl: string;
    publicUrl: string;
    objectKey: string;
}
