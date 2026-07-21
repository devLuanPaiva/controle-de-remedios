package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDTO(
        @NotBlank String token,
        @NotBlank @Size(min = 6, max = 20) String newPassword,
        @NotBlank String confirmPassword) {
}
