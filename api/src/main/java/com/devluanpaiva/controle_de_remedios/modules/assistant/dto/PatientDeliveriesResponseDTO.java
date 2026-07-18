package com.devluanpaiva.controle_de_remedios.modules.assistant.dto;

import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;

public record PatientDeliveriesResponseDTO(
        UUID patientId,
        String patientName,
        List<DeliveryResponseDTO> deliveries,
        List<PendingDeliveryItemResponseDTO> pendingItems) {
}
