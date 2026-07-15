package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;

public final class DeliverySpecification {
    private DeliverySpecification() {
    }

    public static Specification<Delivery> associatedWithManager(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("company").join("users").get("id"), userId);
    }

    public static Specification<Delivery> associatedWithPatientUser(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("patient").join("user").get("id"), userId);
    }

    public static Specification<Delivery> hasPatientId(UUID patientId) {
        if (patientId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("patient").get("id"), patientId);
    }

    public static Specification<Delivery> hasMedicineId(UUID medicineId) {
        if (medicineId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(
                root.join("prescriptionItem").join("medicine").get("id"), medicineId);
    }
}
