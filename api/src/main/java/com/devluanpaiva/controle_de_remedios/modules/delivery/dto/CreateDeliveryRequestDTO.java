package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

public record CreateDeliveryRequestDTO(
        @NotNull UUID prescriptionItemId,
        @NotNull @PastOrPresent LocalDate deliveryDate,
        @NotNull @Positive Integer deliveryQuantity) {
}
