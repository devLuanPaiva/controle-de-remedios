package com.devluanpaiva.controle_de_remedios.modules.medicine.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.CreateMedicineRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineResolutionService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {
    private final CompanyRepository companyRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineMapper medicineMapper;
    private final MedicineResolutionService medicineResolutionService;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public MedicineResponseDTO createMedicine(CreateMedicineRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(dto.companyId());

        assertCanManage(actor, company.getId());

        Medicine medicine = medicineResolutionService.resolveOrCreate(
                company, dto.name(), dto.eanCode(), dto.imageUrl());

        return medicineMapper.toResponseDTO(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponseDTO getMedicineById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Medicine medicine = findMedicineOrThrow(id);

        assertCanManage(actor, medicine.getCompany().getId());

        return medicineMapper.toResponseDTO(medicine);
    }

    private void assertCanManage(User actor, UUID companyId) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT), () -> isMemberOf(companyId, actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }

    private Company findCompanyOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Empresa não encontrada",
                        "COMPANY_NOT_FOUND",
                        "companyId",
                        "Não foi possível encontrar uma empresa com o ID '" + id + "'."));
    }

    private Medicine findMedicineOrThrow(UUID id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado",
                        "MEDICINE_NOT_FOUND",
                        "medicineId",
                        "Não foi possível encontrar um medicamento com o ID '" + id + "'."));
    }
}
