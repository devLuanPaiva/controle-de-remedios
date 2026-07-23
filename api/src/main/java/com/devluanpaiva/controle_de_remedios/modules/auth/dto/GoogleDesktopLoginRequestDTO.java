package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleDesktopLoginRequestDTO(
        @NotBlank String code,
        @NotBlank String codeVerifier,
        @NotBlank String redirectUri) {

}
