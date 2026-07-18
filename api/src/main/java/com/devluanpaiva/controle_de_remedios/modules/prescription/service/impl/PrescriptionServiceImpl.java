package com.devluanpaiva.controle_de_remedios.modules.prescription.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryEligibilityService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineResolutionService;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
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
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.CreatePrescriptionItemMedicineRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.CreatePrescriptionItemRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
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
    private final MedicineRepository medicineRepository;
    private final MedicineResolutionService medicineResolutionService;
    private final DeliveryEligibilityService deliveryEligibilityService;
    private final MedicineMovementService medicineMovementService;
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

        List<CreatePrescriptionItemRequestDTO> itemDtos = dto.items();
        List<PrescriptionItem> items = new ArrayList<>();

        for (int index = 0; index < itemDtos.size(); index++) {
            items.add(buildPrescriptionItem(itemDtos.get(index), index, prescription, patient));
        }

        prescription.getItems().addAll(items);

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        savedPrescription.getItems().forEach(medicineMovementService::recordRequested);

        return prescriptionMapper.toResponseDTO(savedPrescription);
    }

    private PrescriptionItem buildPrescriptionItem(
            CreatePrescriptionItemRequestDTO dto, int index, Prescription prescription, Patient patient) {
        Medicine medicine = resolveMedicine(dto, index, patient.getCompany());

        try {
            deliveryEligibilityService.assertEligible(patient, medicine);
        } catch (BusinessException ex) {
            throw withIndexedField(ex, index);
        }

        return PrescriptionItem.builder()
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .dosage(dto.dosage())
                .prescribedQuantity(dto.prescribedQuantity())
                .unityType(dto.unityType())
                .frequency(dto.frequency())
                .frequencyType(dto.frequencyType())
                .treatmentType(dto.treatmentType())
                .treatmentDays(dto.treatmentDays())
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    private Medicine resolveMedicine(CreatePrescriptionItemRequestDTO dto, int index, Company company) {
        try {
            if (dto.medicineId() != null) {
                return findMedicineOrThrow(dto.medicineId(), company.getId());
            }

            if (dto.medicine() == null || !StringUtils.hasText(dto.medicine().name())) {
                throw new BusinessException(
                        HttpStatus.UNPROCESSABLE_CONTENT,
                        "Medicamento inválido",
                        "MEDICINE_REQUIRED",
                        "medicineId",
                        "Informe o ID de um medicamento existente ou os dados para cadastrar um novo.");
            }

            CreatePrescriptionItemMedicineRequestDTO medicine = dto.medicine();
            return medicineResolutionService.resolveOrCreate(
                    company, medicine.name(), medicine.eanCode(), medicine.imageUrl());
        } catch (BusinessException ex) {
            throw withIndexedField(ex, index);
        }
    }

    private BusinessException withIndexedField(BusinessException ex, int index) {
        String indexedField = StringUtils.hasText(ex.getField())
                ? "items[" + index + "]." + ex.getField()
                : "items[" + index + "]";

        return new BusinessException(ex.getStatus(), ex.getMessage(), ex.getCode(), indexedField, ex.getDetail());
    }

    private Medicine findMedicineOrThrow(UUID id, UUID companyId) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado",
                        "MEDICINE_NOT_FOUND",
                        "medicine.id",
                        "Não foi possível encontrar um medicamento com o ID '" + id + "'."));

        if (!medicine.getCompany().getId().equals(companyId)) {
            throw new BusinessException(
                    HttpStatus.UNPROCESSABLE_CONTENT,
                    "Medicamento inválido",
                    "MEDICINE_COMPANY_MISMATCH",
                    "medicine.id",
                    "O medicamento informado não pertence à empresa do paciente.");
        }

        return medicine;
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
            case MANAGER, ASSISTANT -> PrescriptionSpecification.associatedWithManager(actor.getId());
            case PATIENT -> PrescriptionSpecification.associatedWithPatientUser(actor.getId());
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

        assertCanDelete(actor, prescription.getPatient());

        prescriptionRepository.delete(prescription);
    }

    private void assertCanManage(User actor, Patient patient) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(patient.getCompany().getId(), actor));
    }

    private void assertCanDelete(User actor, Patient patient) {
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
