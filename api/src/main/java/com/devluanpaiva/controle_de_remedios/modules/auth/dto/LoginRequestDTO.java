package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String password) {

}
