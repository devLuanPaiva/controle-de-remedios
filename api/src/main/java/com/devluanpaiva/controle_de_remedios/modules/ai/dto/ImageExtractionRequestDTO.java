package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record ImageExtractionRequestDTO(
        @NotBlank String image) {
}
