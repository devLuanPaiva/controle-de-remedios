package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record AvailabilityItemDTO(
        UUID deliveryId,
        UUID patientId,
        String patientName,
        String medicineName,
        UnityType unityType,
        LocalDate nextAvailableDate,
        Long daysUntilAvailable) {
}
