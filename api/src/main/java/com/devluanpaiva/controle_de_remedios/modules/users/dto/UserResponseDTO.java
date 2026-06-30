package com.devluanpaiva.controle_de_remedios.modules.users.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        String imageUrl,
        String cpf,
        UserRole role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

}
