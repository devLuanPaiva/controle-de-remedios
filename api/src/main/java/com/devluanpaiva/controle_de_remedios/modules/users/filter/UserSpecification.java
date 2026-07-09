package com.devluanpaiva.controle_de_remedios.modules.users.filter;

import java.util.Collection;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

public final class UserSpecification {
    private UserSpecification() {
    }

    public static Specification<User> hasRoleIn(Collection<UserRole> roles) {
        return (root, query, builder) -> root.get("role").in(roles);
    }

    public static Specification<User> hasRole(UserRole role) {
        if (role == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("role"), role);
    }

    public static Specification<User> associatedWithCompany(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.join("companies").get("id"), companyId);
    }

    public static Specification<User> hasName(String name) {
        return containsIgnoreCase("name", name);
    }

    public static Specification<User> hasEmail(String email) {
        return containsIgnoreCase("email", email);
    }

    public static Specification<User> hasCpf(String cpf) {
        return containsIgnoreCase("cpf", cpf);
    }

    public static Specification<User> isActive(Boolean active) {
        if (active == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("active"), active);
    }

    private static Specification<User> containsIgnoreCase(String field, String value) {
        if (!StringUtils.hasText(value)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.get(field)),
                "%" + value.toLowerCase() + "%");
    }
}
