package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.util.UUID;

public record PrescriptionPatientSummaryDTO(
        UUID id,
        String name) {
}
