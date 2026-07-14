package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;

public record PrescriptionDetailResponseDTO(
        UUID id,
        PrescriptionStatus status,
        List<String> imageUrls,
        LocalDate issueDate,
        UUID patientId,
        PatientResponseDTO patient,
        List<PrescriptionItemResponseDTO> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
