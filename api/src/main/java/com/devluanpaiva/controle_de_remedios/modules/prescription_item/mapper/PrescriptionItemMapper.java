package com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Component
public class PrescriptionItemMapper {

    public PrescriptionItemResponseDTO toResponseDTO(PrescriptionItem item) {
        return new PrescriptionItemResponseDTO(
                item.getId(),
                item.getPrescription().getId(),
                item.getStatus(),
                item.getDosage(),
                item.getPrescribedQuantity(),
                item.getUnityType(),
                item.getFrequency(),
                item.getFrequencyType(),
                item.getTreatmentType(),
                item.getTreatmentDays(),
                item.getObservations(),
                item.getStartDate(),
                item.getReceivedQuantity(),
                item.getDeliveredQuantity(),
                item.getRequestedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
