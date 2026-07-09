package com.devluanpaiva.controle_de_remedios.modules.user.dto;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequestDTO(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 20) String password,
        @NotBlank @Size(min = 11, max = 11) String cpf,
        String imageUrl,
        @NotNull UserRole role,
        UUID companyId) {
}