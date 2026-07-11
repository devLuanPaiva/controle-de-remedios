package com.devluanpaiva.controle_de_remedios.modules.storage.dto;

import jakarta.validation.constraints.NotBlank;

public record PresignedUploadRequestDTO(
        @NotBlank String fileName,
        @NotBlank String contentType) {
}
