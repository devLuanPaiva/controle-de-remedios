package com.devluanpaiva.controle_de_remedios.security;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

public record JwtParamsDTO(
        UUID userId, String email, String name, UserRole role, String cpf, String type, long expirationMillis) {

}
