package com.devluanpaiva.controle_de_remedios.modules.delivery.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;

@Component
public class DeliveryMapper {
    public DeliveryResponseDTO toResponseDTO(Delivery delivery) {
        return new DeliveryResponseDTO(
                delivery.getId(),
                delivery.getCompany().getId(),
                delivery.getPatient().getId(),
                delivery.getPatient().getName(),
                delivery.getPrescriptionItem().getId(),
                delivery.getPrescriptionItem().getMedicine().getName(),
                delivery.getPrescriptionItem().getUnityType(),
                delivery.getDeliveryDate(),
                delivery.getNextAvailableDate(),
                delivery.getDeliveryQuantity(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt());
    }
}
