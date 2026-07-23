package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequestDTO(
        @NotBlank String idToken) {

}
