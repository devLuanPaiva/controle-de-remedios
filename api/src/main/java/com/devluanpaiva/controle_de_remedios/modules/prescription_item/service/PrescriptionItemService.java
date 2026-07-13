package com.devluanpaiva.controle_de_remedios.modules.prescription_item.service;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.UpdatePrescriptionItemRequestDTO;

public interface PrescriptionItemService {
    PrescriptionItemResponseDTO getPrescriptionItemById(UUID id);

    PrescriptionItemResponseDTO updatePrescriptionItem(UUID id, UpdatePrescriptionItemRequestDTO dto);

    void deletePrescriptionItem(UUID id);
}
