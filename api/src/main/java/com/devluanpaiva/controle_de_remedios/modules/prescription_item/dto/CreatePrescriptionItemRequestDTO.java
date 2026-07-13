package com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreatePrescriptionItemRequestDTO(
        @NotBlank @Size(max = 50) String dosage,
        @NotNull @Positive Integer prescribedQuantity,
        @NotNull UnityType unityType,
        @NotNull @Positive Integer frequency,
        @NotNull FrequencyType frequencyType,
        @NotNull TreatmentType treatmentType,
        @NotNull @Positive Integer treatmentDays) {
}
