package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliverySpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {
        private static final List<PrescriptionStatus> DELIVERABLE_STATUSES = List.of(
                        PrescriptionStatus.PENDING, PrescriptionStatus.APPROVED);

        private final DeliveryRepository deliveryRepository;
        private final PrescriptionItemRepository prescriptionItemRepository;
        private final MedicineRepository medicineRepository;
        private final CompanyRepository companyRepository;
        private final DeliveryMapper deliveryMapper;
        private final PrescriptionItemMapper prescriptionItemMapper;
        private final MedicineMovementService medicineMovementService;
        private final SecurityContextHelper securityContextHelper;
        private final AuthorizationPolicy authorizationPolicy;

        @Override
        @Transactional
        public DeliveryResponseDTO createDelivery(CreateDeliveryRequestDTO dto) {
                User actor = securityContextHelper.getCurrentUser();
                PrescriptionItem item = findPrescriptionItemOrThrow(dto.prescriptionItemId());
                Patient patient = item.getPrescription().getPatient();

                assertCanManage(actor, patient);

                if (item.getDelivery() != null) {
                        throw new BusinessException(
                                        HttpStatus.CONFLICT,
                                        "Item de receita já entregue",
                                        "DELIVERY_ALREADY_EXISTS",
                                        "prescriptionItemId",
                                        "Já existe uma entrega registrada para este item de receita.");
                }

                if (!DELIVERABLE_STATUSES.contains(item.getStatus())) {
                        throw new BusinessException(
                                        HttpStatus.CONFLICT,
                                        "Item de receita não pode ser entregue",
                                        "PRESCRIPTION_ITEM_NOT_DELIVERABLE",
                                        "prescriptionItemId",
                                        "O item de receita está com status '" + item.getStatus()
                                                        + "' e não pode ser entregue.");
                }

                if (dto.deliveryQuantity() > item.getPrescribedQuantity()) {
                        throw new BusinessException(
                                        HttpStatus.UNPROCESSABLE_CONTENT,
                                        "Quantidade de entrega inválida",
                                        "DELIVERY_QUANTITY_EXCEEDS_PRESCRIBED_QUANTITY",
                                        "deliveryQuantity",
                                        "A quantidade entregue não pode ser maior que a quantidade prescrita.");
                }

                Delivery delivery = Delivery.builder()
                                .company(patient.getCompany())
                                .patient(patient)
                                .prescriptionItem(item)
                                .deliveryDate(dto.deliveryDate())
                                .nextAvailableDate(dto.deliveryDate().plusDays(item.getTreatmentDays()))
                                .deliveryQuantity(dto.deliveryQuantity())
                                .build();

                Delivery savedDelivery = deliveryRepository.save(delivery);

                item.setDeliveredQuantity(dto.deliveryQuantity());
                item.setStatus(dto.deliveryQuantity() < item.getPrescribedQuantity()
                                ? PrescriptionStatus.PARTIAL_DELIVERED
                                : PrescriptionStatus.DELIVERED);
                prescriptionItemRepository.save(item);

                medicineMovementService.recordDelivered(savedDelivery);

                return deliveryMapper.toResponseDTO(savedDelivery);
        }

        @Override
        @Transactional
        public PrescriptionItemResponseDTO reserveStock(UUID prescriptionItemId, ReserveStockRequestDTO dto) {
                User actor = securityContextHelper.getCurrentUser();
                PrescriptionItem item = findPrescriptionItemOrThrow(prescriptionItemId);

                assertCanManage(actor, item.getPrescription().getPatient());

                int reservedQuantity = item.getReceivedQuantity() + dto.quantity();
                if (reservedQuantity > item.getPrescribedQuantity()) {
                        throw new BusinessException(
                                        HttpStatus.UNPROCESSABLE_CONTENT,
                                        "Reserva de estoque inválida",
                                        "RESERVATION_EXCEEDS_PRESCRIBED_QUANTITY",
                                        "quantity",
                                        "A quantidade reservada não pode ultrapassar a quantidade prescrita.");
                }

                item.setReceivedQuantity(reservedQuantity);
                PrescriptionItem updatedItem = prescriptionItemRepository.save(item);

                return prescriptionItemMapper.toResponseDTO(updatedItem);
        }

        @Override
        @Transactional(readOnly = true)
        public DeliveryResponseDTO getDeliveryById(UUID id) {
                User actor = securityContextHelper.getCurrentUser();
                Delivery delivery = findDeliveryOrThrow(id);

                assertCanView(actor, delivery.getPatient());

                return deliveryMapper.toResponseDTO(delivery);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<DeliveryResponseDTO> listDeliveries(DeliveryFilter filter, Pageable pageable) {
                User actor = securityContextHelper.getCurrentUser();

                Specification<Delivery> specification = visibilityScope(actor)
                                .and(DeliverySpecification.hasPatientId(filter.patientId()))
                                .and(DeliverySpecification.hasMedicineId(filter.medicineId()));

                return deliveryRepository.findAll(specification, pageable)
                                .map(deliveryMapper::toResponseDTO);
        }

        @Override
        @Transactional(readOnly = true)
        public List<PendingQueueItemResponseDTO> getPendingQueue(UUID medicineId) {
                User actor = securityContextHelper.getCurrentUser();
                Medicine medicine = findMedicineOrThrow(medicineId);

                authorizationPolicy.requireAdminOrRoleWithCondition(
                                actor, UserRole.MANAGER, () -> isMemberOf(medicine.getCompany().getId(), actor));

                List<PrescriptionItem> pendingItems = prescriptionItemRepository
                                .findByMedicine_IdAndStatusInAndDeliveryIsNullOrderByCreatedAtAsc(medicineId,
                                                DELIVERABLE_STATUSES);

                return pendingItems.stream()
                                .map(item -> new PendingQueueItemResponseDTO(
                                                item.getId(),
                                                item.getPrescription().getPatient().getId(),
                                                item.getPrescription().getPatient().getName(),
                                                medicine.getId(),
                                                medicine.getName(),
                                                item.getPrescribedQuantity(),
                                                item.getReceivedQuantity(),
                                                item.getPrescribedQuantity() - item.getReceivedQuantity(),
                                                item.getRequestedAt()))
                                .toList();
        }

        private Specification<Delivery> visibilityScope(User actor) {
                return switch (actor.getRole()) {
                        case ADMIN -> Specification.unrestricted();
                        case MANAGER -> DeliverySpecification.associatedWithManager(actor.getId());
                        case PATIENT -> DeliverySpecification.associatedWithPatientUser(actor.getId());
                        case USER -> throw authorizationPolicy.forbidden();
                };
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

        private PrescriptionItem findPrescriptionItemOrThrow(UUID id) {
                return prescriptionItemRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "Item de receita não encontrado",
                                                "PRESCRIPTION_ITEM_NOT_FOUND",
                                                "prescriptionItemId",
                                                "Não foi possível encontrar um item de receita com o ID '" + id
                                                                + "'."));
        }

        private Delivery findDeliveryOrThrow(UUID id) {
                return deliveryRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "Entrega não encontrada",
                                                "DELIVERY_NOT_FOUND",
                                                "id",
                                                "Não foi possível encontrar uma entrega com o ID '" + id + "'."));
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
