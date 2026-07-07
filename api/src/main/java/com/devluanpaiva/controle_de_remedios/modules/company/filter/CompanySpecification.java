package com.devluanpaiva.controle_de_remedios.modules.company.filter;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;

public final class CompanySpecification {
    private CompanySpecification() {
    }

    public static Specification<Company> associatedWith(UUID userId) {
        return (root, query, builder) -> builder.equal(root.join("users").get("id"), userId);
    }

    public static Specification<Company> hasName(String name) {
        return containsIgnoreCase("name", name);
    }

    public static Specification<Company> hasSlug(String slug) {
        return containsIgnoreCase("slug", slug);
    }

    public static Specification<Company> hasCnpj(String cnpj) {
        return containsIgnoreCase("cnpj", cnpj);
    }

    private static Specification<Company> containsIgnoreCase(String field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get(field)),
                "%" + value.toLowerCase() + "%");
    }
}
