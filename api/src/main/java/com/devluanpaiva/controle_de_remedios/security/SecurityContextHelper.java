package com.devluanpaiva.controle_de_remedios.security;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Component
public class SecurityContextHelper {
    public UUID getCurrentUserId() {
        return getAuthenticatedUser().getId();
    }

    public User getCurrentUser() {
        return getAuthenticatedUser();
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw unauthorizedUser();
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        throw unauthorizedUser();
    }

    private BusinessException unauthorizedUser() {
        return new BusinessException(
                HttpStatus.UNAUTHORIZED,
                "Usuário não autenticado",
                "AUTH_UNAUTHORIZED",
                "authorization",
                "É necessário estar autenticado para acessar este recurso");
    }
}
