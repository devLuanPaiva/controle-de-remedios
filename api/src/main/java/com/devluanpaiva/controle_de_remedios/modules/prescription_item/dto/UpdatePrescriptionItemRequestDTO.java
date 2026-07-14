package com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdatePrescriptionItemRequestDTO(
        PrescriptionStatus status,
        @Size(min = 1, max = 50) String dosage,
        @Positive Integer prescribedQuantity,
        UnityType unityType,
        @Positive Integer frequency,
        FrequencyType frequencyType,
        TreatmentType treatmentType,
        @Positive Integer treatmentDays,
        @Size(max = 200) String observations,
        LocalDate startDate,
        @PositiveOrZero Integer receivedQuantity,
        @PositiveOrZero Integer deliveredQuantity,
        LocalDateTime requestedAt) {
}
