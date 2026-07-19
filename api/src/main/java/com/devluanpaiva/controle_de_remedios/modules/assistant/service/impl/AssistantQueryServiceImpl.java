package com.devluanpaiva.controle_de_remedios.modules.assistant.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.DeliverySummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.PatientDeliveriesResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.AssistantQueryService;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliverySpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemSpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientSpecification;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssistantQueryServiceImpl implements AssistantQueryService {
    private static final int SUMMARY_LIMIT = 10;

    private final DeliveryRepository deliveryRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PatientRepository patientRepository;
    private final DeliveryMapper deliveryMapper;
    private final PendingDeliveryItemMapper pendingDeliveryItemMapper;

    @Override
    @Transactional(readOnly = true)
    public DeliverySummaryResponseDTO getDeliveriesSummary(UUID companyId) {
        Specification<PrescriptionItem> pendingSpec = PendingDeliveryItemSpecification.isDeliverable()
                .and(PendingDeliveryItemSpecification.hasCompanyId(companyId));

        long pendingCount = prescriptionItemRepository.count(pendingSpec);

        Pageable topPending = PageRequest.of(0, SUMMARY_LIMIT, Sort.by(Sort.Direction.ASC, "requestedAt"));
        List<PendingDeliveryItemResponseDTO> pendingItems = prescriptionItemRepository
                .findAll(pendingSpec, topPending)
                .map(pendingDeliveryItemMapper::toResponseDTO)
                .getContent();

        Pageable topRecent = PageRequest.of(0, SUMMARY_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<DeliveryResponseDTO> recentDeliveries = deliveryRepository
                .findAll(DeliverySpecification.hasCompanyId(companyId), topRecent)
                .map(deliveryMapper::toResponseDTO)
                .getContent();

        return new DeliverySummaryResponseDTO(pendingCount, pendingItems, recentDeliveries);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDeliveriesResponseDTO getPatientDeliveries(UUID companyId, String patientName) {
        Patient patient = findSinglePatientOrThrow(companyId, patientName);

        List<DeliveryResponseDTO> deliveries = deliveryRepository
                .findAll(DeliverySpecification.hasPatientId(patient.getId()), Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(deliveryMapper::toResponseDTO)
                .toList();

        Specification<PrescriptionItem> pendingSpec = PendingDeliveryItemSpecification.isDeliverable()
                .and(PendingDeliveryItemSpecification.hasCompanyId(companyId))
                .and(PendingDeliveryItemSpecification.hasPatientName(patient.getName()));

        List<PendingDeliveryItemResponseDTO> pendingItems = prescriptionItemRepository.findAll(pendingSpec).stream()
                .map(pendingDeliveryItemMapper::toResponseDTO)
                .toList();

        return new PatientDeliveriesResponseDTO(patient.getId(), patient.getName(), deliveries, pendingItems);
    }

    private Patient findSinglePatientOrThrow(UUID companyId, String patientName) {
        List<Patient> matches = patientRepository.findAll(
                PatientSpecification.hasCompanyId(companyId).and(PatientSpecification.hasName(patientName)));

        if (matches.isEmpty()) {
            throw new BusinessException(
                    HttpStatus.NOT_FOUND,
                    "Paciente não encontrado",
                    "PATIENT_NOT_FOUND",
                    "patientName",
                    "Não foi possível encontrar um paciente com o nome informado nesta empresa.");
        }

        if (matches.size() > 1) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Mais de um paciente encontrado",
                    "PATIENT_NAME_AMBIGUOUS",
                    "patientName",
                    "Mais de um paciente foi encontrado com o nome informado nesta empresa. "
                            + "Peça o CPF ou o nome completo para identificar o paciente correto.");
        }

        return matches.get(0);
    }
}
