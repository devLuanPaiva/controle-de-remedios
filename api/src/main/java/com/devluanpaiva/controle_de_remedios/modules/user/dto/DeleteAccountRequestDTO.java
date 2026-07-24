package com.devluanpaiva.controle_de_remedios.modules.user.dto;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequestDTO(
        @NotBlank String password) {
}
