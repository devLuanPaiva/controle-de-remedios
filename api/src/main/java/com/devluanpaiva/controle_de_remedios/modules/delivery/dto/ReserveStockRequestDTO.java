package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ReserveStockRequestDTO(
        @NotNull @Positive Integer quantity) {
}
