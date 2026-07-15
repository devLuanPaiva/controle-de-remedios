package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineMovementResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;

@Component
public class MedicineMovementMapper {
    public MedicineMovementResponseDTO toResponseDTO(MedicineMovement movement) {
        return new MedicineMovementResponseDTO(
                movement.getId(),
                movement.getMedicine().getId(),
                movement.getMedicine().getName(),
                movement.getPrescriptionItem() != null ? movement.getPrescriptionItem().getId() : null,
                movement.getQuantity(),
                movement.getMovementDate(),
                movement.getMovementType(),
                movement.getCreatedAt());
    }
}
