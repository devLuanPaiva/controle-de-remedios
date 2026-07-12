import { apiFetch } from "@/lib/apiFetch";
import { PresignedUploadRequest, PresignedUploadResponse, UploadContext } from "@/data/models/presigned-upload.model";

async function requestPresignedUrl(
    fileName: string,
    contentType: string,
    context: UploadContext,
    ownerName?: string,
): Promise<PresignedUploadResponse> {
    const payload: PresignedUploadRequest = { fileName, contentType, context, ownerName };

    const response = await apiFetch<PresignedUploadResponse>("/uploads/presigned-url", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function uploadImage(
    localUri: string,
    fileName: string,
    contentType: string,
    context: UploadContext,
    ownerName?: string,
): Promise<string> {
    const presigned = await requestPresignedUrl(fileName, contentType, context, ownerName);

    const fileResponse = await fetch(localUri);
    const blob = await fileResponse.blob();

    const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
    });

    if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar a imagem.");
    }

    return presigned.publicUrl;
}

export async function uploadImagesSequentially(
    localUris: string[],
    context: UploadContext,
    onProgress?: (completed: number, total: number) => void,
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let index = 0; index < localUris.length; index++) {
        const fileName = `receita-${Date.now()}-${index}.jpg`;
        const publicUrl = await uploadImage(localUris[index], fileName, "image/jpeg", context);

        uploadedUrls.push(publicUrl);
        onProgress?.(index + 1, localUris.length);
    }

    return uploadedUrls;
}
