package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record DeliveryResponseDTO(
        UUID id,
        UUID companyId,
        UUID patientId,
        UUID prescriptionItemId,
        LocalDate deliveryDate,
        LocalDate nextAvailableDate,
        Integer deliveryQuantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
