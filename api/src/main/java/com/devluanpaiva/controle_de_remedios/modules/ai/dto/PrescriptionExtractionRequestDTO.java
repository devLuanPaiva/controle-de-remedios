package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record PrescriptionExtractionRequestDTO(
        @NotEmpty List<@NotBlank String> images) {
}
