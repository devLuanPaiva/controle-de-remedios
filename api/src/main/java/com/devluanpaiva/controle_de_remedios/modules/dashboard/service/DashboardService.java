package com.devluanpaiva.controle_de_remedios.modules.dashboard.service;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.AvailabilityListResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryQueueSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryTimelineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.FulfillmentSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionStatusBreakdownResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.enums.DeliveryTimelineGranularity;

public interface DashboardService {
    PrescriptionStatusBreakdownResponseDTO getPrescriptionStatusBreakdown(UUID companyId);

    DeliveryQueueSummaryResponseDTO getQueueSummary(UUID companyId);

    AvailabilityListResponseDTO getUpcomingAvailability(UUID companyId, int days);

    AvailabilityListResponseDTO getOverdueAvailability(UUID companyId);

    FulfillmentSummaryResponseDTO getFulfillmentSummary(UUID companyId, LocalDate from, LocalDate to);

    DeliveryTimelineResponseDTO getDeliveryTimeline(
            UUID companyId, LocalDate from, LocalDate to, DeliveryTimelineGranularity granularity);
}
