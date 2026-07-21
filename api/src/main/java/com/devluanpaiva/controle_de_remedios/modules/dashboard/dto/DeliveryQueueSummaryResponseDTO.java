package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

import java.util.List;

public record DeliveryQueueSummaryResponseDTO(
        Long pendingCount,
        Double averageWaitDays,
        List<QueueItemDTO> oldestPending) {
}
