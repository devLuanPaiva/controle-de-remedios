package com.devluanpaiva.controle_de_remedios.modules.delivery.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Component
public class PendingDeliveryItemMapper {
    public PendingDeliveryItemResponseDTO toResponseDTO(PrescriptionItem item) {
        Prescription prescription = item.getPrescription();

        return new PendingDeliveryItemResponseDTO(
                item.getId(),
                prescription.getId(),
                prescription.getPatient().getId(),
                prescription.getPatient().getName(),
                prescription.getIssueDate(),
                item.getMedicine().getName(),
                item.getUnityType(),
                item.getPrescribedQuantity());
    }
}
