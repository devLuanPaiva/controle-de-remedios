package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record EligiblePrescriptionItemResponseDTO(
        UUID id,
        PrescriptionStatus status,
        String dosage,
        UnityType unityType,
        Integer receivedQuantity,
        Integer deliveredQuantity,
        String medicineName,
        String medicineEanCode) {
}
