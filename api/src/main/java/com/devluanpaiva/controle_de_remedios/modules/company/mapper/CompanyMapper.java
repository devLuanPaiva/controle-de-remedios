package com.devluanpaiva.controle_de_remedios.modules.company.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;

@Component
public class CompanyMapper {
    public CompanyResponseDTO toResponseDTO(Company company) {
        return new CompanyResponseDTO(
                company.getId(),
                company.getName(),
                company.getSlug(),
                company.getCnpj(),
                company.getImageUrl(),
                company.getActive(),
                company.getCreatedAt(),
                company.getUpdatedAt());
    }
}
