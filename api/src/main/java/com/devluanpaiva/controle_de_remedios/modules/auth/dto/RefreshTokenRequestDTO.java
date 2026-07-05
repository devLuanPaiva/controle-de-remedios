package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequestDTO(
        @NotBlank String refreshToken) {

}
