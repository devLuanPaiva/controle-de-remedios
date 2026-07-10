package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PatientResponseDTO(
        UUID id,
        String name,
        String cpf,
        LocalDate birthDate,
        UUID companyId,
        UUID userId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
