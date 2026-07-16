package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;

public record MedicineMovementResponseDTO(
                UUID id,
                UUID medicineId,
                String medicineName,
                UUID prescriptionItemId,
                Integer quantity,
                LocalDate movementDate,
                MovementType movementType,
                LocalDateTime createdAt) {
}
