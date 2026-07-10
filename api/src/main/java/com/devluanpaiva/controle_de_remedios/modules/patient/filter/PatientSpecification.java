package com.devluanpaiva.controle_de_remedios.modules.patient.filter;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;

public final class PatientSpecification {
    private PatientSpecification() {
    }

    public static Specification<Patient> associatedWithUser(UUID userId) {
        return (root, query, builder) -> builder.equal(root.join("company").join("users").get("id"), userId);
    }

    public static Specification<Patient> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<Patient> hasName(String name) {
        return containsIgnoreCase("name", name);
    }

    public static Specification<Patient> hasCpf(String cpf) {
        return containsIgnoreCase("cpf", cpf);
    }

    private static Specification<Patient> containsIgnoreCase(String field, String value) {
        if (!StringUtils.hasText(value)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get(field)),
                "%" + value.toLowerCase() + "%");
    }
}
