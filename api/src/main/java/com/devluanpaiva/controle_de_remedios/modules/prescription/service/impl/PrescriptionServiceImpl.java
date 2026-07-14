package com.devluanpaiva.controle_de_remedios.modules.prescription.service.impl;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.CreatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.UpdatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionFilter;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionSpecification;
import com.devluanpaiva.controle_de_remedios.modules.prescription.mapper.PrescriptionMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.PrescriptionService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final CompanyRepository companyRepository;
    private final PrescriptionMapper prescriptionMapper;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public PrescriptionResponseDTO createPrescription(CreatePrescriptionRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientOrThrow(dto.patientId());

        assertCanManage(actor, patient);

        Prescription prescription = Prescription.builder()
                .status(PrescriptionStatus.PENDING)
                .imageUrls(dto.imageUrls() != null ? new ArrayList<>(dto.imageUrls()) : new ArrayList<>())
                .issueDate(dto.issueDate())
                .patient(patient)
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return prescriptionMapper.toResponseDTO(savedPrescription);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionDetailResponseDTO getPrescriptionById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Prescription prescription = findPrescriptionOrThrow(id);

        assertCanView(actor, prescription.getPatient());

        return prescriptionMapper.toDetailResponseDTO(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionListItemResponseDTO> getPrescriptions(PrescriptionFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        Specification<Prescription> specification = visibilityScope(actor)
                .and(PrescriptionSpecification.hasPatientId(filter.patientId()))
                .and(PrescriptionSpecification.hasPatientName(filter.patientName()))
                .and(PrescriptionSpecification.hasPatientCpf(filter.patientCpf()))
                .and(PrescriptionSpecification.hasStatus(filter.status()))
                .and(PrescriptionSpecification.hasIssueDate(filter.issueDate()));

        return prescriptionRepository.findAll(specification, pageable)
                .map(prescriptionMapper::toListItemResponseDTO);
    }

    private Specification<Prescription> visibilityScope(User actor) {
        return switch (actor.getRole()) {
            case ADMIN -> Specification.unrestricted();
            case MANAGER -> PrescriptionSpecification.associatedWithManager(actor.getId());
            case PATIENT -> PrescriptionSpecification.associatedWithPatientUser(actor.getId());
            case USER -> throw authorizationPolicy.forbidden();
        };
    }

    @Override
    @Transactional
    public PrescriptionResponseDTO updatePrescription(UUID id, UpdatePrescriptionRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Prescription prescription = findPrescriptionOrThrow(id);

        assertCanManage(actor, prescription.getPatient());

        if (dto.status() != null) {
            prescription.setStatus(dto.status());
        }

        if (dto.imageUrls() != null) {
            prescription.setImageUrls(new ArrayList<>(dto.imageUrls()));
        }

        if (dto.issueDate() != null) {
            prescription.setIssueDate(dto.issueDate());
        }

        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return prescriptionMapper.toResponseDTO(updatedPrescription);
    }

    @Override
    @Transactional
    public void deletePrescription(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Prescription prescription = findPrescriptionOrThrow(id);

        assertCanManage(actor, prescription.getPatient());

        prescriptionRepository.delete(prescription);
    }

    private void assertCanManage(User actor, Patient patient) {
        authorizationPolicy.requireAdminOrRoleWithCondition(
                actor, UserRole.MANAGER, () -> isMemberOf(patient.getCompany().getId(), actor));
    }

    private void assertCanView(User actor, Patient patient) {
        boolean isSelf = actor.getRole() == UserRole.PATIENT
                && patient.getUser() != null
                && patient.getUser().getId().equals(actor.getId());

        authorizationPolicy.requireAdminOrCondition(
                actor, () -> isSelf || isMemberOf(patient.getCompany().getId(), actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }

    private Patient findPatientOrThrow(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Paciente não encontrado",
                        "PATIENT_NOT_FOUND",
                        "patientId",
                        "Não foi possível encontrar um paciente com o ID '" + id + "'."));
    }

    private Prescription findPrescriptionOrThrow(UUID id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Receita não encontrada",
                        "PRESCRIPTION_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma receita com o ID '" + id + "'."));
    }
}
