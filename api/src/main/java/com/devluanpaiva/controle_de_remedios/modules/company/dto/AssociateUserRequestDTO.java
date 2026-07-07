package com.devluanpaiva.controle_de_remedios.modules.company.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AssociateUserRequestDTO(
        @NotNull UUID userId) {
}
