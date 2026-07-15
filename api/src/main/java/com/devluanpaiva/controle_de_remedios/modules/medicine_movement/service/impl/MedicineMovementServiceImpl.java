package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.CreateMedicineMovementRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineBalanceResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineMovementResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter.MedicineMovementFilter;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter.MedicineMovementSpecification;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.mapper.MedicineMovementMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository.MedicineMovementRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository.MovementTypeTotal;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicineMovementServiceImpl implements MedicineMovementService {
    private final MedicineMovementRepository medicineMovementRepository;
    private final MedicineRepository medicineRepository;
    private final CompanyRepository companyRepository;
    private final MedicineMovementMapper medicineMovementMapper;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public MedicineMovementResponseDTO registerReceived(CreateMedicineMovementRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        Medicine medicine = findMedicineOrThrow(dto.medicineId());

        assertCanManage(actor, medicine);

        MedicineMovement movement = MedicineMovement.builder()
                .medicine(medicine)
                .quantity(dto.quantity())
                .movementDate(dto.movementDate())
                .movementType(MovementType.RECEIVED)
                .build();

        MedicineMovement savedMovement = medicineMovementRepository.save(movement);
        return medicineMovementMapper.toResponseDTO(savedMovement);
    }

    @Override
    @Transactional
    public void recordRequested(PrescriptionItem item) {
        MedicineMovement movement = MedicineMovement.builder()
                .medicine(item.getMedicine())
                .prescriptionItem(item)
                .quantity(item.getPrescribedQuantity())
                .movementDate(item.getRequestedAt().toLocalDate())
                .movementType(MovementType.REQUESTED)
                .build();

        medicineMovementRepository.save(movement);
    }

    @Override
    @Transactional
    public void recordDelivered(Delivery delivery) {
        MedicineMovement movement = MedicineMovement.builder()
                .medicine(delivery.getPrescriptionItem().getMedicine())
                .prescriptionItem(delivery.getPrescriptionItem())
                .quantity(delivery.getDeliveryQuantity())
                .movementDate(delivery.getDeliveryDate())
                .movementType(MovementType.DELIVERED)
                .build();

        medicineMovementRepository.save(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineBalanceResponseDTO getBalance(UUID medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);

        List<MovementTypeTotal> totals = medicineMovementRepository.sumQuantityByMedicineGroupedByType(medicineId);
        Map<MovementType, Long> totalsByType = totals.stream()
                .collect(Collectors.toMap(MovementTypeTotal::getMovementType, MovementTypeTotal::getTotal));

        long totalReceived = totalsByType.getOrDefault(MovementType.RECEIVED, 0L);
        long totalDelivered = totalsByType.getOrDefault(MovementType.DELIVERED, 0L);
        long totalRequested = totalsByType.getOrDefault(MovementType.REQUESTED, 0L);

        return new MedicineBalanceResponseDTO(
                medicine.getId(),
                medicine.getName(),
                totalReceived,
                totalDelivered,
                totalRequested,
                totalReceived - totalDelivered,
                totalRequested - totalDelivered);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineMovementResponseDTO> listMovements(MedicineMovementFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        Specification<MedicineMovement> specification = visibilityScope(actor)
                .and(MedicineMovementSpecification.hasMedicineId(filter.medicineId()))
                .and(MedicineMovementSpecification.hasMovementType(filter.movementType()))
                .and(MedicineMovementSpecification.hasMovementDateAfterOrEqual(filter.startDate()))
                .and(MedicineMovementSpecification.hasMovementDateBeforeOrEqual(filter.endDate()));

        return medicineMovementRepository.findAll(specification, pageable)
                .map(medicineMovementMapper::toResponseDTO);
    }

    private Specification<MedicineMovement> visibilityScope(User actor) {
        return switch (actor.getRole()) {
            case ADMIN -> Specification.unrestricted();
            case MANAGER, ASSISTANT -> MedicineMovementSpecification.associatedWithManager(actor.getId());
            case PATIENT -> throw authorizationPolicy.forbidden();
        };
    }

    private void assertCanManage(User actor, Medicine medicine) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(medicine.getCompany().getId(), actor));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
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
