package com.devluanpaiva.controle_de_remedios.modules.prescription.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.CreatePrescriptionItemRequestDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record CreatePrescriptionRequestDTO(
        List<@Size(max = 255) String> imageUrls,
        @NotNull @PastOrPresent LocalDate issueDate,
        @NotNull UUID patientId,
        @NotEmpty @Valid List<CreatePrescriptionItemRequestDTO> items) {
}
