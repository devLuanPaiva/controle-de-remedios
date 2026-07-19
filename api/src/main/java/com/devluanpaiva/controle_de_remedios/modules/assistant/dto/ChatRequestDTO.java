package com.devluanpaiva.controle_de_remedios.modules.assistant.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatRequestDTO(
        @NotNull UUID companyId,
        @NotBlank @Size(max = 2000) String message,
        UUID conversationId) {
}
