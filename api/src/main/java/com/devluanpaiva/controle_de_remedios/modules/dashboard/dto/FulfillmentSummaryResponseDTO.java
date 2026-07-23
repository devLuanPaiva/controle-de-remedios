package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record FulfillmentSummaryResponseDTO(
        Long deliveredCount,
        Long partialCount,
        Long totalCount,
        Double completionRate,
        Long prescribedQuantityTotal,
        Long deliveredQuantityTotal,
        Double coverageRate) {
}
