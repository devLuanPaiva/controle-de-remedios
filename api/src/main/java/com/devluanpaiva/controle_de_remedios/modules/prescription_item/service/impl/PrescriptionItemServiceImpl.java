package com.devluanpaiva.controle_de_remedios.modules.prescription_item.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.UpdatePrescriptionItemRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.service.PrescriptionItemService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionItemServiceImpl implements PrescriptionItemService {
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final CompanyRepository companyRepository;
    private final PrescriptionItemMapper prescriptionItemMapper;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional(readOnly = true)
    public PrescriptionItemResponseDTO getPrescriptionItemById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = findPrescriptionItemOrThrow(id);

        assertCanView(actor, item.getPrescription().getPatient());

        return prescriptionItemMapper.toResponseDTO(item);
    }

    @Override
    @Transactional
    public PrescriptionItemResponseDTO updatePrescriptionItem(UUID id, UpdatePrescriptionItemRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = findPrescriptionItemOrThrow(id);

        assertCanManage(actor, item.getPrescription().getPatient());

        if (dto.status() != null) {
            item.setStatus(dto.status());
        }

        if (dto.dosage() != null) {
            item.setDosage(dto.dosage());
        }

        if (dto.prescribedQuantity() != null) {
            item.setPrescribedQuantity(dto.prescribedQuantity());
        }

        if (dto.unityType() != null) {
            item.setUnityType(dto.unityType());
        }

        if (dto.frequency() != null) {
            item.setFrequency(dto.frequency());
        }

        if (dto.frequencyType() != null) {
            item.setFrequencyType(dto.frequencyType());
        }

        if (dto.treatmentType() != null) {
            item.setTreatmentType(dto.treatmentType());
        }

        if (dto.treatmentDays() != null) {
            item.setTreatmentDays(dto.treatmentDays());
        }

        if (dto.observations() != null) {
            item.setObservations(dto.observations());
        }

        if (dto.startDate() != null) {
            item.setStartDate(dto.startDate());
        }

        if (dto.receivedQuantity() != null) {
            item.setReceivedQuantity(dto.receivedQuantity());
        }

        if (dto.deliveredQuantity() != null) {
            item.setDeliveredQuantity(dto.deliveredQuantity());
        }

        if (dto.requestedAt() != null) {
            item.setRequestedAt(dto.requestedAt());
        }

        PrescriptionItem updatedItem = prescriptionItemRepository.save(item);
        return prescriptionItemMapper.toResponseDTO(updatedItem);
    }

    @Override
    @Transactional
    public void deletePrescriptionItem(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = findPrescriptionItemOrThrow(id);

        assertCanDelete(actor, item.getPrescription().getPatient());

        prescriptionItemRepository.delete(item);
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

    private PrescriptionItem findPrescriptionItemOrThrow(UUID id) {
        return prescriptionItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Item de receita não encontrado",
                        "PRESCRIPTION_ITEM_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um item de receita com o ID '" + id + "'."));
    }
}
