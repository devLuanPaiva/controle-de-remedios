package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

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

    public static Specification<Delivery> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("company").get("id"), companyId);
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

    public static Specification<Delivery> hasMedicineName(String medicineName) {
        if (!StringUtils.hasText(medicineName)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("prescriptionItem").join("medicine").get("name")),
                "%" + medicineName.toLowerCase() + "%");
    }

    public static Specification<Delivery> hasPatientName(String patientName) {
        if (!StringUtils.hasText(patientName)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("patient").get("name")),
                "%" + patientName.toLowerCase() + "%");
    }

    public static Specification<Delivery> hasPatientEmail(String patientEmail) {
        if (!StringUtils.hasText(patientEmail)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("patient").join("user").get("email")),
                "%" + patientEmail.toLowerCase() + "%");
    }

    public static Specification<Delivery> hasPatientCpf(String patientCpf) {
        if (!StringUtils.hasText(patientCpf)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("patient").get("cpf")),
                "%" + patientCpf.toLowerCase() + "%");
    }
}
