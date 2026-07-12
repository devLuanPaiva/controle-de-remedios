package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public record PrescriptionResponseDTO(
        UUID id,
        PrescriptionStatus status,
        String imageUrl,
        LocalDate issueDate,
        UUID patientId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
