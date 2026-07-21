package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.time.LocalDate;

public record DeliveryTimelinePointDTO(
        LocalDate periodStart,
        Long deliveriesCount,
        Long quantityTotal) {
}
