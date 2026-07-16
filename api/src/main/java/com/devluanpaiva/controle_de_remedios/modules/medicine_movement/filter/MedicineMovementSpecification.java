package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;

public final class MedicineMovementSpecification {
    private MedicineMovementSpecification() {
    }

    public static Specification<MedicineMovement> associatedWithManager(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("medicine").join("company").join("users").get("id"), userId);
    }

    public static Specification<MedicineMovement> hasMedicineId(UUID medicineId) {
        if (medicineId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("medicine").get("id"), medicineId);
    }

    public static Specification<MedicineMovement> hasMovementType(MovementType movementType) {
        if (movementType == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("movementType"), movementType);
    }

    public static Specification<MedicineMovement> hasMovementDateAfterOrEqual(LocalDate startDate) {
        if (startDate == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("movementDate"), startDate);
    }

    public static Specification<MedicineMovement> hasMovementDateBeforeOrEqual(LocalDate endDate) {
        if (endDate == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get("movementDate"), endDate);
    }
}
