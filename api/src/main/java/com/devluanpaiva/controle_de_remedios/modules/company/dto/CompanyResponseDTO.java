package com.devluanpaiva.controle_de_remedios.modules.company.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompanyResponseDTO(
        UUID id,
        String name,
        String slug,
        String cnpj,
        String imageUrl,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
