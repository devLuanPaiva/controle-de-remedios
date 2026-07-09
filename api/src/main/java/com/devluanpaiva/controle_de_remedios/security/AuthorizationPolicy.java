package com.devluanpaiva.controle_de_remedios.security;

import java.util.function.BooleanSupplier;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Component
public class AuthorizationPolicy {

    public void requireAdmin(User actor) {
        if (!isAdmin(actor)) {
            throw forbidden();
        }
    }

    public void requireAdminOrCondition(User actor, BooleanSupplier condition) {
        if (isAdmin(actor) || condition.getAsBoolean()) {
            return;
        }

        throw forbidden();
    }

    public void requireAdminOrRoleWithCondition(User actor, UserRole allowedRole, BooleanSupplier condition) {
        if (isAdmin(actor)) {
            return;
        }

        if (actor.getRole() == allowedRole && condition.getAsBoolean()) {
            return;
        }

        throw forbidden();
    }

    public void requireSelfOrManageable(User actor, User target) {
        if (actor.getId().equals(target.getId()) || actor.getRole().canManage(target.getRole())) {
            return;
        }

        throw forbidden();
    }

    public void requireManageableRole(User actor, UserRole targetRole) {
        if (!actor.getRole().canManage(targetRole)) {
            throw forbidden();
        }
    }

    public void requireCondition(boolean condition) {
        if (!condition) {
            throw forbidden();
        }
    }

    private boolean isAdmin(User actor) {
        return actor.getRole() == UserRole.ADMIN;
    }

    public BusinessException forbidden() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "Acesso negado",
                "AUTH_FORBIDDEN",
                "authorization",
                "Você não possui permissão para executar esta ação.");
    }
}
