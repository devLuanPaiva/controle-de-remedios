package com.devluanpaiva.controle_de_remedios.modules.users.dto;

import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(
                @NotBlank String name,
                @NotBlank @Size(min = 11, max = 11) String cpf,
                String imageUrl,
                @NotBlank UserRole role) {
}
