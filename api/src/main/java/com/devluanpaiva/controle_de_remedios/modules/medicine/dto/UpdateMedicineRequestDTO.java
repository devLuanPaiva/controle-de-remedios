package com.devluanpaiva.controle_de_remedios.modules.medicine.dto;

import jakarta.validation.constraints.Size;

public record UpdateMedicineRequestDTO(
        @Size(max = 200) String name,
        @Size(max = 200) String imageUrl) {
}
