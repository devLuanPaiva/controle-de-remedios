package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record EligiblePrescriptionResponseDTO(
        UUID id,
        String coverImageUrl,
        LocalDate issueDate,
        List<EligiblePrescriptionItemResponseDTO> items) {
}
