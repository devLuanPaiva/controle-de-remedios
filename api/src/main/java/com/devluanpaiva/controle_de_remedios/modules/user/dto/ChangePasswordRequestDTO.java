package com.devluanpaiva.controle_de_remedios.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDTO(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6, max = 20) String newPassword,
        @NotBlank String confirmPassword) {
}
