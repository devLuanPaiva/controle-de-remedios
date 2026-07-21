package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.util.List;

public record AvailabilityListResponseDTO(
        Long count,
        List<AvailabilityItemDTO> items) {
}
