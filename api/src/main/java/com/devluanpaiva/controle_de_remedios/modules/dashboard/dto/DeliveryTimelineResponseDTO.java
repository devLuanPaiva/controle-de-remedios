package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.util.List;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.enums.DeliveryTimelineGranularity;

public record DeliveryTimelineResponseDTO(
        DeliveryTimelineGranularity granularity,
        List<DeliveryTimelinePointDTO> points) {
}
