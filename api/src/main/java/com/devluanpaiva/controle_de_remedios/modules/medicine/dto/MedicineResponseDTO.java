package com.devluanpaiva.controle_de_remedios.modules.medicine.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MedicineResponseDTO(
        UUID id,
        String name,
        String eanCode,
        String imageUrl,
        UUID companyId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
