package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record UpdatePrescriptionRequestDTO(
        PrescriptionStatus status,
        @Size(max = 255) String imageUrl,
        @PastOrPresent LocalDate issueDate) {
}
