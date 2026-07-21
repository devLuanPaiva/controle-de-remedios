package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.util.List;

public record PrescriptionStatusBreakdownResponseDTO(
        Long totalPrescriptions,
        List<PrescriptionStatusCountDTO> items) {
}
