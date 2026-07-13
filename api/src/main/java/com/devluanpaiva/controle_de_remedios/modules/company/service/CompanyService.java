package com.devluanpaiva.controle_de_remedios.modules.company.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CreateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.UpdateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanyFilter;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.filter.MedicineFilter;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;

public interface CompanyService {
    CompanyResponseDTO createCompany(CreateCompanyRequestDTO dto);

    CompanyResponseDTO getCompanyById(UUID id);

    Page<CompanyResponseDTO> getCompanies(CompanyFilter filter, Pageable pageable);

    CompanyResponseDTO updateCompany(UUID id, UpdateCompanyRequestDTO dto);

    void deleteCompany(UUID id);

    Page<UserResponseDTO> getCompanyUsers(UUID companyId, Pageable pageable);

    void associateUser(UUID companyId, UUID userId);

    void removeUser(UUID companyId, UUID userId);

    Page<MedicineResponseDTO> getCompanyMedicines(UUID companyId, MedicineFilter filter, Pageable pageable);
}
