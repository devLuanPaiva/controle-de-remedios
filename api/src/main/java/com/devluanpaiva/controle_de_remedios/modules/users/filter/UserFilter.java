package com.devluanpaiva.controle_de_remedios.modules.users.filter;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

public record UserFilter(
        UUID companyId,
        UserRole role,
        String name,
        String email,
        String cpf,
        Boolean active) {
}
