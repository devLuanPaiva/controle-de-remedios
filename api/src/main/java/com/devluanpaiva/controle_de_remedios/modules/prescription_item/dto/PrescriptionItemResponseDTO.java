package com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record PrescriptionItemResponseDTO(
        UUID id,
        UUID prescriptionId,
        PrescriptionStatus status,
        String dosage,
        Integer prescribedQuantity,
        UnityType unityType,
        Integer frequency,
        FrequencyType frequencyType,
        TreatmentType treatmentType,
        Integer treatmentDays,
        String observations,
        LocalDate startDate,
        Integer receivedQuantity,
        Integer deliveredQuantity,
        LocalDateTime requestedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
