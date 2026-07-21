package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record QueueItemDTO(
        UUID prescriptionItemId,
        UUID prescriptionId,
        UUID patientId,
        String patientName,
        String medicineName,
        UnityType unityType,
        Integer prescribedQuantity,
        LocalDateTime requestedAt,
        Long waitingDays) {
}
