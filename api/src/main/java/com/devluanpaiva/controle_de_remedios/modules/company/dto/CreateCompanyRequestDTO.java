package com.devluanpaiva.controle_de_remedios.modules.company.dto;

import com.devluanpaiva.controle_de_remedios.shared.validation.Cnpj;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCompanyRequestDTO(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Cnpj String cnpj,
        @Size(max = 255) String imageUrl) {
}
