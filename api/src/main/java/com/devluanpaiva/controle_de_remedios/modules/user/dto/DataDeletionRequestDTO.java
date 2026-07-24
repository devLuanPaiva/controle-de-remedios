package com.devluanpaiva.controle_de_remedios.modules.user.dto;

import jakarta.validation.constraints.Size;

public record DataDeletionRequestDTO(
        @Size(max = 1000) String message) {
}
