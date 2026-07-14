package com.devluanpaiva.controle_de_remedios.modules.medicine.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMedicineRequestDTO(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 14) String eanCode,
        @NotBlank @Size(max = 200) String imageUrl,
        @NotNull UUID companyId) {
}
