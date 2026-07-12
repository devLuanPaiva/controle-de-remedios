package com.devluanpaiva.controle_de_remedios.modules.prescription.filter;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public final class PrescriptionSpecification {
    private PrescriptionSpecification() {
    }

    public static Specification<Prescription> associatedWithManager(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("patient").join("company").join("users").get("id"), userId);
    }

    public static Specification<Prescription> associatedWithPatientUser(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("patient").join("user").get("id"), userId);
    }

    public static Specification<Prescription> hasPatientId(UUID patientId) {
        if (patientId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("patient").get("id"), patientId);
    }

    public static Specification<Prescription> hasPatientName(String name) {
        if (!StringUtils.hasText(name)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get("patient").get("name")),
                "%" + name.toLowerCase() + "%");
    }

    public static Specification<Prescription> hasPatientCpf(String cpf) {
        if (!StringUtils.hasText(cpf)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get("patient").get("cpf")),
                "%" + cpf.toLowerCase() + "%");
    }

    public static Specification<Prescription> hasStatus(PrescriptionStatus status) {
        if (status == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("status"), status);
    }

    public static Specification<Prescription> hasIssueDate(LocalDate issueDate) {
        if (issueDate == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("issueDate"), issueDate);
    }
}
