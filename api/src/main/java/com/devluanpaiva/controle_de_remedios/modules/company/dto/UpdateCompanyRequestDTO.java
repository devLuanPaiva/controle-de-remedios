package com.devluanpaiva.controle_de_remedios.modules.company.dto;

import jakarta.validation.constraints.Size;

public record UpdateCompanyRequestDTO(
        @Size(min = 1, max = 120) String name,
        @Size(max = 255) String imageUrl,
        Boolean active) {
}
