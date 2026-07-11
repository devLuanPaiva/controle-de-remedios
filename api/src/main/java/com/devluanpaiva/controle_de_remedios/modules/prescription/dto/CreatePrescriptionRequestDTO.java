package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record CreatePrescriptionRequestDTO(
        @Size(max = 255) String imageUrl,
        @NotNull @PastOrPresent LocalDate issueDate,
        @NotNull UUID patientId) {
}
