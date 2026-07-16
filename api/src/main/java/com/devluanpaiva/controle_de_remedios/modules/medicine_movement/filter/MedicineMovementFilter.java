package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;

public record MedicineMovementFilter(
                UUID medicineId,
                MovementType movementType,
                LocalDate startDate,
                LocalDate endDate) {
}
