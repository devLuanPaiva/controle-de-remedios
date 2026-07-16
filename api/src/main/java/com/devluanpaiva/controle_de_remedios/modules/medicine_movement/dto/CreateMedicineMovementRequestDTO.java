package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

public record CreateMedicineMovementRequestDTO(
                @NotNull UUID medicineId,
                @NotNull @Positive Integer quantity,
                @NotNull @PastOrPresent LocalDate movementDate) {
}
