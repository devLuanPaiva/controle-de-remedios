package com.devluanpaiva.controle_de_remedios.modules.medicine.filter;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;

public final class MedicineSpecification {
    private MedicineSpecification() {
    }

    public static Specification<Medicine> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<Medicine> hasName(String name) {
        return containsIgnoreCase("name", name);
    }

    public static Specification<Medicine> hasEanCode(String eanCode) {
        return containsIgnoreCase("eanCode", eanCode);
    }

    private static Specification<Medicine> containsIgnoreCase(String field, String value) {
        if (!StringUtils.hasText(value)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get(field)),
                "%" + value.toLowerCase() + "%");
    }
}
