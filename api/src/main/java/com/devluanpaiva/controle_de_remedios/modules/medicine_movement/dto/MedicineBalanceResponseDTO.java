package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto;

import java.util.UUID;

public record MedicineBalanceResponseDTO(
                UUID medicineId,
                String medicineName,
                Long totalReceived,
                Long totalDelivered,
                Long totalRequested,
                Long availableBalance,
                Long pendingDemand) {
}
