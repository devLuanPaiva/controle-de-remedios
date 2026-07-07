package com.devluanpaiva.controle_de_remedios.modules.company.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CreateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.UpdateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanyFilter;

public interface CompanyService {
    CompanyResponseDTO createCompany(CreateCompanyRequestDTO dto);

    CompanyResponseDTO getCompanyById(UUID id);

    Page<CompanyResponseDTO> getCompanies(CompanyFilter filter, Pageable pageable);

    CompanyResponseDTO updateCompany(UUID id, UpdateCompanyRequestDTO dto);

    void deleteCompany(UUID id);

    void associateUser(UUID companyId, UUID userId);

    void removeUser(UUID companyId, UUID userId);
}
