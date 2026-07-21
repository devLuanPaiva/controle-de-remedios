package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import com.devluanpaiva.controle_de_remedios.modules.auth.enums.RequestContext;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ForgotPasswordRequestDTO(
        @NotBlank @Email String email,
        @NotNull RequestContext context) {
}
