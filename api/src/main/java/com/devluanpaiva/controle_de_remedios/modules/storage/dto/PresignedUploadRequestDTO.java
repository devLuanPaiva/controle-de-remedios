package com.devluanpaiva.controle_de_remedios.modules.storage.dto;

import com.devluanpaiva.controle_de_remedios.modules.storage.enums.UploadContext;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PresignedUploadRequestDTO(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @NotNull UploadContext context,
        String ownerName) {
}
