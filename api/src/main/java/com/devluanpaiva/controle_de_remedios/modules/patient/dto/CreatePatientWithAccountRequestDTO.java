package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.shared.validation.Cpf;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record CreatePatientWithAccountRequestDTO(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Cpf String cpf,
        @NotNull @Past LocalDate birthDate,
        @NotNull UUID companyId,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 20) String password,
        @Size(max = 255) String imageUrl,
        @Size(max = 20) String contact,
        @Size(max = 255) String address) {
}
