package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record PendingQueueItemResponseDTO(
        UUID prescriptionItemId,
        UUID patientId,
        String patientName,
        UUID medicineId,
        String medicineName,
        Integer prescribedQuantity,
        Integer receivedQuantity,
        Integer remainingQuantity,
        LocalDateTime requestedAt) {
}
