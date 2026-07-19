package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.time.LocalDate;

import com.devluanpaiva.controle_de_remedios.shared.validation.Cpf;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record UpdatePatientRequestDTO(
        @Size(min = 1, max = 120) String name,
        @Cpf String cpf,
        @Past LocalDate birthDate,
        @Size(max = 20) String contact,
        @Size(max = 255) String address) {
}
