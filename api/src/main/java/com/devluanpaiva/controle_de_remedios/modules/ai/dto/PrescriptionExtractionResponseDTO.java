package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.util.List;

public record PrescriptionExtractionResponseDTO(
        boolean available,
        String patientName,
        String issueDate,
        List<ExtractedMedicationDTO> medications) {
}
