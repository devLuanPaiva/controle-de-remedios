package com.devluanpaiva.controle_de_remedios.modules.users.dto;

public record ChangePasswordRequestDTO(
        String currentPassword,
        String newPassword,
        String token) {
}
