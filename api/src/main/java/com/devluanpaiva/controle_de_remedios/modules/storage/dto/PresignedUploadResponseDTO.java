package com.devluanpaiva.controle_de_remedios.modules.storage.dto;

public record PresignedUploadResponseDTO(
        String uploadUrl,
        String publicUrl,
        String objectKey) {
}
