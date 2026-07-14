package com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto;

import jakarta.validation.constraints.Size;

public record CreatePrescriptionItemMedicineRequestDTO(
        @Size(max = 200) String name,
        @Size(max = 14) String eanCode,
        @Size(max = 200) String imageUrl) {
}
