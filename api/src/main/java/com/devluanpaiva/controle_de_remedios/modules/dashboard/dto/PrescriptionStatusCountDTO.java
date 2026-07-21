package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public record PrescriptionStatusCountDTO(
        PrescriptionStatus status,
        Long count) {
}
