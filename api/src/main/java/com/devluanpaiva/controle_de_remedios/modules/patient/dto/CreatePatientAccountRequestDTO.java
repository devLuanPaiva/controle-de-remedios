package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePatientAccountRequestDTO(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 20) String password) {
}
