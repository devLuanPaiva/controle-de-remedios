package com.devluanpaiva.controle_de_remedios.modules.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCompanyRequestDTO(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(min = 14, max = 14) String cnpj,
        String imageUrl) {
}
