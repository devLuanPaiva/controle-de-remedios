package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
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
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliverySpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemSpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
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

        private static final List<PrescriptionStatus> ELIGIBLE_PRESCRIPTION_STATUSES = List.of(
                        PrescriptionStatus.PENDING, PrescriptionStatus.PARTIAL_DELIVERED);

        private final DeliveryRepository deliveryRepository;
        private final PrescriptionItemRepository prescriptionItemRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final PatientRepository patientRepository;
        private final MedicineRepository medicineRepository;
        private final CompanyRepository companyRepository;
        private final DeliveryMapper deliveryMapper;
        private final PendingDeliveryItemMapper pendingDeliveryItemMapper;
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
                assertDeliverable(item);

                if (dto.deliveryQuantity() > item.getPrescribedQuantity()) {
                        throw new BusinessException(
                                        HttpStatus.UNPROCESSABLE_CONTENT,
                                        "Quantidade de entrega inválida",
                                        "DELIVERY_QUANTITY_EXCEEDS_PRESCRIBED_QUANTITY",
                                        "deliveryQuantity",
                                        "A quantidade entregue não pode ser maior que a quantidade prescrita.");
                }

                Delivery savedDelivery = buildAndPersistDelivery(item, patient, dto.deliveryDate(), dto.deliveryQuantity());

                return deliveryMapper.toResponseDTO(savedDelivery);
        }

        @Override
        @Transactional
        public List<DeliveryResponseDTO> deliverAllPendingItems(UUID prescriptionId) {
                User actor = securityContextHelper.getCurrentUser();
                Prescription prescription = findPrescriptionOrThrow(prescriptionId);
                Patient patient = prescription.getPatient();

                assertCanManage(actor, patient);

                LocalDate today = LocalDate.now();

                return prescription.getItems().stream()
                                .filter(item -> item.getDelivery() == null && DELIVERABLE_STATUSES.contains(item.getStatus()))
                                .map(item -> buildAndPersistDelivery(item, patient, today, item.getPrescribedQuantity()))
                                .map(deliveryMapper::toResponseDTO)
                                .toList();
        }

        private void assertDeliverable(PrescriptionItem item) {
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
        }

        private Delivery buildAndPersistDelivery(PrescriptionItem item, Patient patient, LocalDate deliveryDate, int quantity) {
                Delivery delivery = Delivery.builder()
                                .company(patient.getCompany())
                                .patient(patient)
                                .prescriptionItem(item)
                                .deliveryDate(deliveryDate)
                                .nextAvailableDate(deliveryDate.plusDays(item.getTreatmentDays()))
                                .deliveryQuantity(quantity)
                                .build();

                Delivery savedDelivery = deliveryRepository.save(delivery);

                item.setDeliveredQuantity(quantity);
                item.setStatus(quantity < item.getPrescribedQuantity()
                                ? PrescriptionStatus.PARTIAL_DELIVERED
                                : PrescriptionStatus.DELIVERED);
                prescriptionItemRepository.save(item);

                updatePrescriptionStatus(item.getPrescription());

                medicineMovementService.recordDelivered(savedDelivery);

                return savedDelivery;
        }

        private void updatePrescriptionStatus(Prescription prescription) {
                boolean allDelivered = prescription.getItems().stream()
                                .allMatch(prescriptionItem -> prescriptionItem.getStatus() == PrescriptionStatus.DELIVERED);

                prescription.setStatus(allDelivered ? PrescriptionStatus.DELIVERED : PrescriptionStatus.PARTIAL_DELIVERED);
                prescriptionRepository.save(prescription);
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

                if (filter.companyId() == null) {
                        throw new BusinessException(
                                        HttpStatus.BAD_REQUEST,
                                        "Parâmetro obrigatório ausente",
                                        "COMPANY_ID_REQUIRED",
                                        "companyId",
                                        "O parâmetro 'companyId' é obrigatório.");
                }

                Specification<Delivery> specification = visibilityScope(actor)
                                .and(DeliverySpecification.hasCompanyId(filter.companyId()))
                                .and(DeliverySpecification.hasPatientId(filter.patientId()))
                                .and(DeliverySpecification.hasMedicineId(filter.medicineId()))
                                .and(DeliverySpecification.hasMedicineName(filter.medicineName()))
                                .and(DeliverySpecification.hasPatientName(filter.patientName()))
                                .and(DeliverySpecification.hasPatientEmail(filter.patientEmail()))
                                .and(DeliverySpecification.hasPatientCpf(filter.patientCpf()));

                return deliveryRepository.findAll(specification, pageable)
                                .map(deliveryMapper::toResponseDTO);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<PendingDeliveryItemResponseDTO> listPendingDeliveryItems(
                        PendingDeliveryItemFilter filter, Pageable pageable) {
                User actor = securityContextHelper.getCurrentUser();

                if (filter.companyId() == null) {
                        throw new BusinessException(
                                        HttpStatus.BAD_REQUEST,
                                        "Parâmetro obrigatório ausente",
                                        "COMPANY_ID_REQUIRED",
                                        "companyId",
                                        "O parâmetro 'companyId' é obrigatório.");
                }

                authorizationPolicy.requireAdminOrRolesWithCondition(
                                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                                () -> isMemberOf(filter.companyId(), actor));

                Specification<PrescriptionItem> specification = PendingDeliveryItemSpecification.isDeliverable()
                                .and(PendingDeliveryItemSpecification.hasCompanyId(filter.companyId()))
                                .and(PendingDeliveryItemSpecification.hasPatientName(filter.patientName()))
                                .and(PendingDeliveryItemSpecification.hasPatientCpf(filter.patientCpf()));

                return prescriptionItemRepository.findAll(specification, pageable)
                                .map(pendingDeliveryItemMapper::toResponseDTO);
        }

        @Override
        @Transactional(readOnly = true)
        public List<PendingQueueItemResponseDTO> getPendingQueue(UUID medicineId) {
                User actor = securityContextHelper.getCurrentUser();
                Medicine medicine = findMedicineOrThrow(medicineId);

                authorizationPolicy.requireAdminOrRolesWithCondition(
                                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                                () -> isMemberOf(medicine.getCompany().getId(), actor));

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

        @Override
        @Transactional(readOnly = true)
        public List<EligiblePrescriptionResponseDTO> getEligiblePrescriptions(UUID companyId, String cpf) {
                User actor = securityContextHelper.getCurrentUser();
                Patient patient = patientRepository.findByCompany_IdAndCpf(companyId, cpf)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "Paciente não encontrado",
                                                "PATIENT_NOT_FOUND",
                                                "cpf",
                                                "Não foi possível encontrar um paciente com o CPF informado nesta empresa."));

                assertCanManage(actor, patient);

                return prescriptionRepository
                                .findByPatient_IdAndStatusInOrderByIssueDateDesc(patient.getId(), ELIGIBLE_PRESCRIPTION_STATUSES)
                                .stream()
                                .map(this::toEligiblePrescriptionResponseDTO)
                                .toList();
        }

        private EligiblePrescriptionResponseDTO toEligiblePrescriptionResponseDTO(Prescription prescription) {
                String coverImageUrl = prescription.getImageUrls().isEmpty() ? null : prescription.getImageUrls().get(0);

                List<EligiblePrescriptionItemResponseDTO> items = prescription.getItems().stream()
                                .map(item -> new EligiblePrescriptionItemResponseDTO(
                                                item.getId(),
                                                item.getStatus(),
                                                item.getDosage(),
                                                item.getUnityType(),
                                                item.getReceivedQuantity(),
                                                item.getDeliveredQuantity(),
                                                item.getMedicine().getName(),
                                                item.getMedicine().getEanCode()))
                                .toList();

                return new EligiblePrescriptionResponseDTO(
                                prescription.getId(), coverImageUrl, prescription.getIssueDate(), items);
        }

        private Specification<Delivery> visibilityScope(User actor) {
                return switch (actor.getRole()) {
                        case ADMIN -> Specification.unrestricted();
                        case MANAGER, ASSISTANT -> DeliverySpecification.associatedWithManager(actor.getId());
                        case PATIENT -> DeliverySpecification.associatedWithPatientUser(actor.getId());
                };
        }

        private void assertCanManage(User actor, Patient patient) {
                authorizationPolicy.requireAdminOrRolesWithCondition(
                                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                                () -> isMemberOf(patient.getCompany().getId(), actor));
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

        private Prescription findPrescriptionOrThrow(UUID id) {
                return prescriptionRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(
                                                HttpStatus.NOT_FOUND,
                                                "Receita não encontrada",
                                                "PRESCRIPTION_NOT_FOUND",
                                                "prescriptionId",
                                                "Não foi possível encontrar uma receita com o ID '" + id + "'."));
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
