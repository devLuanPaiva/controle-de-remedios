package com.devluanpaiva.controle_de_remedios.modules.patient.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientWithAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.UpdatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientFilter;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientSpecification;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientService;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PatientMapper patientMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public PatientResponseDTO createPatient(CreatePatientRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        assertCanManagePatients(actor);
        assertBelongsToCompany(actor, dto.companyId());

        Company company = findCompanyOrThrow(dto.companyId());
        assertCpfAvailable(dto.companyId(), dto.cpf());

        Patient patient = Patient.builder()
                .name(dto.name())
                .cpf(dto.cpf())
                .birthdate(dto.birthDate().atStartOfDay())
                .company(company)
                .contact(dto.contact())
                .address(dto.address())
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toResponseDTO(savedPatient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(id);

        assertCanView(actor, patient);

        return patientMapper.toResponseDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponseDTO> getPatients(PatientFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT), () -> true);

        if (filter.companyId() != null) {
            assertBelongsToCompany(actor, filter.companyId());
        }

        Specification<Patient> specification = visibilityScope(actor)
                .and(PatientSpecification.hasCompanyId(filter.companyId()))
                .and(PatientSpecification.hasName(filter.name()))
                .and(PatientSpecification.hasCpf(filter.cpf()));

        return patientRepository.findAll(specification, pageable)
                .map(patientMapper::toMaskedResponseDTO);
    }

    private Specification<Patient> visibilityScope(User actor) {
        if (actor.getRole() == UserRole.ADMIN) {
            return Specification.unrestricted();
        }

        return PatientSpecification.associatedWithUser(actor.getId());
    }

    @Override
    @Transactional
    public PatientResponseDTO updatePatient(UUID id, UpdatePatientRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(id);

        assertCanEdit(actor, patient);

        if (dto.name() != null) {
            patient.setName(dto.name());
        }

        if (dto.cpf() != null && !dto.cpf().equals(patient.getCpf())) {
            assertCpfAvailable(patient.getCompany().getId(), dto.cpf());
            patient.setCpf(dto.cpf());
        }

        if (dto.birthDate() != null) {
            patient.setBirthdate(dto.birthDate().atStartOfDay());
        }

        if (dto.contact() != null) {
            patient.setContact(dto.contact());
        }

        if (dto.address() != null) {
            patient.setAddress(dto.address());
        }

        Patient updatedPatient = patientRepository.save(patient);
        return patientMapper.toResponseDTO(updatedPatient);
    }

    @Override
    @Transactional
    public void deletePatient(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(id);

        assertCanDelete(actor, patient);

        patientRepository.delete(patient);
    }

    @Override
    @Transactional
    public UserResponseDTO createPatientAccount(UUID patientId, CreatePatientAccountRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(patientId);

        assertCanManagePatientAccounts(actor, patient);

        if (patient.getUser() != null) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Paciente já possui conta",
                    "PATIENT_ACCOUNT_ALREADY_EXISTS",
                    "patientId",
                    "Este paciente já possui uma conta de usuário vinculada.");
        }

        User user = buildPatientUser(
                patient.getName(), patient.getCpf(), dto.email(), dto.password(), null, patient.getCompany());
        User savedUser = userRepository.save(user);

        patient.setUser(savedUser);
        patientRepository.save(patient);

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    @Transactional
    public PatientResponseDTO createPatientWithAccount(CreatePatientWithAccountRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        assertCanManagePatientAccounts(actor);
        assertBelongsToCompany(actor, dto.companyId());

        Company company = findCompanyOrThrow(dto.companyId());
        assertCpfAvailable(dto.companyId(), dto.cpf());

        User user = buildPatientUser(dto.name(), dto.cpf(), dto.email(), dto.password(), dto.imageUrl(), company);
        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .name(dto.name())
                .cpf(dto.cpf())
                .birthdate(dto.birthDate().atStartOfDay())
                .company(company)
                .user(savedUser)
                .contact(dto.contact())
                .address(dto.address())
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toResponseDTO(savedPatient);
    }

    @Override
    @Transactional
    public void removePatientAccount(UUID patientId) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(patientId);

        assertCanManagePatientAccounts(actor, patient);

        if (patient.getUser() == null) {
            throw new BusinessException(
                    HttpStatus.NOT_FOUND,
                    "Paciente não possui conta",
                    "PATIENT_ACCOUNT_NOT_FOUND",
                    "patientId",
                    "Este paciente não possui uma conta de usuário vinculada.");
        }

        patient.setUser(null);
        patientRepository.save(patient);
    }

    private User buildPatientUser(
            String name, String cpf, String email, String rawPassword, String imageUrl, Company company) {

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado",
                    "EMAIL_ALREADY_EXISTS",
                    "email",
                    "Já existe um usuário cadastrado com o e-mail '" + email + "'.");
        }

        if (userRepository.existsByCpf(cpf)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CPF já cadastrado",
                    "CPF_ALREADY_EXISTS",
                    "cpf",
                    "Já existe um usuário cadastrado com o CPF '" + cpf + "'.");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .cpf(cpf)
                .imageUrl(imageUrl)
                .role(UserRole.PATIENT)
                .password(passwordEncoder.encode(rawPassword))
                .active(true)
                .build();

        user.assignToCompany(company);
        return user;
    }

    private void assertCanManagePatients(User actor) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT), () -> true);
    }

    private void assertCanManagePatientAccounts(User actor) {
        authorizationPolicy.requireAdminOrRoleWithCondition(actor, UserRole.MANAGER, () -> true);
    }

    private void assertCanManagePatientAccounts(User actor, Patient patient) {
        authorizationPolicy.requireAdminOrRoleWithCondition(
                actor, UserRole.MANAGER, () -> isMemberOf(patient.getCompany().getId(), actor));
    }

    private void assertBelongsToCompany(User actor, UUID companyId) {
        authorizationPolicy.requireAdminOrCondition(
                actor, () -> companyRepository.existsByIdAndUsers_Id(companyId, actor.getId()));
    }

    private void assertCanView(User actor, Patient patient) {
        boolean isSelf = actor.getRole() == UserRole.PATIENT
                && patient.getUser() != null
                && patient.getUser().getId().equals(actor.getId());

        authorizationPolicy.requireAdminOrCondition(
                actor, () -> isSelf || isMemberOf(patient.getCompany().getId(), actor));
    }

    private void assertCanEdit(User actor, Patient patient) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(patient.getCompany().getId(), actor));
    }

    private void assertCanDelete(User actor, Patient patient) {
        authorizationPolicy.requireAdminOrRoleWithCondition(
                actor, UserRole.MANAGER, () -> isMemberOf(patient.getCompany().getId(), actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }

    private void assertCpfAvailable(UUID companyId, String cpf) {
        if (patientRepository.existsByCompanyIdAndCpf(companyId, cpf)) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CPF já cadastrado",
                    "PATIENT_CPF_ALREADY_EXISTS",
                    "cpf",
                    "Já existe um paciente cadastrado com o CPF '" + cpf + "' nesta empresa.");
        }
    }

    private Patient findPatientOrThrow(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Paciente não encontrado",
                        "PATIENT_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um paciente com o ID '" + id + "'."));
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
}
