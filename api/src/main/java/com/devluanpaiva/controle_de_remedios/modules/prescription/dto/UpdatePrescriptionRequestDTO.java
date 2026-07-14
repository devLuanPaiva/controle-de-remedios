package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;
import java.util.List;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record UpdatePrescriptionRequestDTO(
        PrescriptionStatus status,
        List<@Size(max = 255) String> imageUrls,
        @PastOrPresent LocalDate issueDate) {
}
