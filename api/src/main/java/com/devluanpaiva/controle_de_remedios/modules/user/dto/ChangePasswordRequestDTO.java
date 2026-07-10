package com.devluanpaiva.controle_de_remedios.modules.user.dto;

public record ChangePasswordRequestDTO(
        String currentPassword,
        String newPassword,
        String token) {
}
