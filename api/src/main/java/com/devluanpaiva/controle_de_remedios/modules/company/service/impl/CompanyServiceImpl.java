package com.devluanpaiva.controle_de_remedios.modules.company.service.impl;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CreateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.UpdateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanyFilter;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanySpecification;
import com.devluanpaiva.controle_de_remedios.modules.company.mapper.CompanyMapper;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.company.service.CompanyService;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.users.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.users.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.devluanpaiva.controle_de_remedios.shared.utils.SlugGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyMapper companyMapper;
    private final UserMapper userMapper;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public CompanyResponseDTO createCompany(CreateCompanyRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        assertIsAdmin(actor);

        if (companyRepository.existsByCnpj(dto.cnpj())) {
            throw cnpjAlreadyExists(dto.cnpj());
        }

        Company company = Company.builder()
                .name(dto.name())
                .cnpj(dto.cnpj())
                .imageUrl(dto.imageUrl())
                .slug(generateUniqueSlug(dto.name(), null))
                .active(true)
                .build();

        Company savedCompany = companyRepository.save(company);

        attachCreatorToCompany(actor.getId(), savedCompany);

        return companyMapper.toResponseDTO(savedCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDTO getCompanyById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(id);

        assertCanView(actor, company);

        return companyMapper.toResponseDTO(company);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponseDTO> getCompanies(CompanyFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        Specification<Company> specification = visibilityScope(actor)
                .and(CompanySpecification.hasName(filter.name()))
                .and(CompanySpecification.hasSlug(filter.slug()))
                .and(CompanySpecification.hasCnpj(filter.cnpj()));

        return companyRepository.findAll(specification, pageable)
                .map(companyMapper::toResponseDTO);
    }

    private Specification<Company> visibilityScope(User actor) {
        if (actor.getRole() == UserRole.ADMIN) {
            return Specification.unrestricted();
        }

        return CompanySpecification.associatedWith(actor.getId());
    }

    @Override
    @Transactional
    public CompanyResponseDTO updateCompany(UUID id, UpdateCompanyRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(id);

        assertCanEdit(actor, company);

        if (dto.name() != null) {
            company.setName(dto.name());
            company.setSlug(generateUniqueSlug(dto.name(), id));
        }

        if (dto.imageUrl() != null) {
            company.setImageUrl(dto.imageUrl());
        }

        if (dto.active() != null) {
            company.setActive(dto.active());
        }

        Company updatedCompany = companyRepository.save(company);
        return companyMapper.toResponseDTO(updatedCompany);
    }

    @Override
    @Transactional
    public void deleteCompany(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(id);

        assertIsAdmin(actor);

        companyRepository.delete(company);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getCompanyUsers(UUID companyId, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(companyId);

        assertCanView(actor, company);

        return userRepository.findByCompanies_Id(companyId, pageable)
                .map(userMapper::toResponseDTO);
    }

    @Override
    @Transactional
    public void associateUser(UUID companyId, UUID userId) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(companyId);
        User targetUser = findUserOrThrow(userId);

        assertCanManageCompanyUser(actor, company, targetUser);

        targetUser.assignToCompany(company);
        userRepository.save(targetUser);
    }

    @Override
    @Transactional
    public void removeUser(UUID companyId, UUID userId) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(companyId);
        User targetUser = findUserOrThrow(userId);

        assertCanManageCompanyUser(actor, company, targetUser);

        targetUser.unassignFromCompany(company);
        userRepository.save(targetUser);
    }

    private void attachCreatorToCompany(UUID actorId, Company company) {
        User managedActor = findUserOrThrow(actorId);
        managedActor.assignToCompany(company);
        userRepository.save(managedActor);
    }

    private String generateUniqueSlug(String name, UUID excludeCompanyId) {
        String baseSlug = SlugGenerator.generate(name);
        String candidateSlug = baseSlug;
        int suffix = 1;

        while (isSlugTaken(candidateSlug, excludeCompanyId)) {
            candidateSlug = baseSlug + "-" + suffix++;
        }

        return candidateSlug;
    }

    private boolean isSlugTaken(String slug, UUID excludeCompanyId) {
        if (excludeCompanyId == null) {
            return companyRepository.existsBySlug(slug);
        }

        return companyRepository.existsBySlugAndIdNot(slug, excludeCompanyId);
    }

    private void assertIsAdmin(User actor) {
        authorizationPolicy.requireAdmin(actor);
    }

    private void assertCanView(User actor, Company company) {
        authorizationPolicy.requireAdminOrCondition(actor, () -> company.hasUser(actor.getId()));
    }

    private void assertCanEdit(User actor, Company company) {
        authorizationPolicy.requireAdminOrRoleWithCondition(
                actor, UserRole.MANAGER, () -> company.hasUser(actor.getId()));
    }

    private void assertCanManageCompanyUser(User actor, Company company, User targetUser) {
        authorizationPolicy.requireManageableRole(actor, targetUser.getRole());

        if (actor.getRole() == UserRole.MANAGER) {
            authorizationPolicy.requireCondition(company.hasUser(actor.getId()));
        }
    }

    private Company findCompanyOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Empresa não encontrada",
                        "COMPANY_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma empresa com o ID '" + id + "'."));
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));
    }

    private BusinessException cnpjAlreadyExists(String cnpj) {
        return new BusinessException(
                HttpStatus.CONFLICT,
                "CNPJ já cadastrado",
                "CNPJ_ALREADY_EXISTS",
                "cnpj",
                "Já existe uma empresa cadastrada com o CNPJ '" + cnpj + "'.");
    }
}
