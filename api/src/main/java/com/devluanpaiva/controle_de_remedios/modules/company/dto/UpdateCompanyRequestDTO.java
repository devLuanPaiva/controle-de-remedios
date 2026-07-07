package com.devluanpaiva.controle_de_remedios.modules.company.dto;

public record UpdateCompanyRequestDTO(
        String name,
        String imageUrl,
        Boolean active) {
}
