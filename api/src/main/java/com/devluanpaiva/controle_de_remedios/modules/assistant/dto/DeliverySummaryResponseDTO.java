package com.devluanpaiva.controle_de_remedios.modules.assistant.dto;

import java.util.List;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;

public record DeliverySummaryResponseDTO(
        long pendingCount,
        List<PendingDeliveryItemResponseDTO> pendingItems,
        List<DeliveryResponseDTO> recentDeliveries) {
}
