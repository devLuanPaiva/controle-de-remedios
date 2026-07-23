package com.devluanpaiva.controle_de_remedios.modules.dashboard.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.AvailabilityListResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryQueueSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveryTimelineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.FulfillmentSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionStatusBreakdownResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.enums.DeliveryTimelineGranularity;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.DashboardService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private static final int DEFAULT_UPCOMING_DAYS = 7;

    private final DashboardService dashboardService;

    @GetMapping("/prescriptions/status-breakdown")
    public ApiResponse<PrescriptionStatusBreakdownResponseDTO> getPrescriptionStatusBreakdown(
            @RequestParam UUID companyId) {
        return ApiResponseFactory.success(
                "Distribuição de status das receitas obtida com sucesso",
                dashboardService.getPrescriptionStatusBreakdown(companyId));
    }

    @GetMapping("/deliveries/queue-summary")
    public ApiResponse<DeliveryQueueSummaryResponseDTO> getQueueSummary(@RequestParam UUID companyId) {
        return ApiResponseFactory.success(
                "Resumo da fila de entregas obtido com sucesso", dashboardService.getQueueSummary(companyId));
    }

    @GetMapping("/deliveries/upcoming-availability")
    public ApiResponse<AvailabilityListResponseDTO> getUpcomingAvailability(
            @RequestParam UUID companyId, @RequestParam(defaultValue = "" + DEFAULT_UPCOMING_DAYS) int days) {
        return ApiResponseFactory.success(
                "Próximas liberações de entrega obtidas com sucesso",
                dashboardService.getUpcomingAvailability(companyId, days));
    }

    @GetMapping("/deliveries/overdue-availability")
    public ApiResponse<AvailabilityListResponseDTO> getOverdueAvailability(@RequestParam UUID companyId) {
        return ApiResponseFactory.success(
                "Entregas em atraso obtidas com sucesso", dashboardService.getOverdueAvailability(companyId));
    }

    @GetMapping("/deliveries/fulfillment-summary")
    public ApiResponse<FulfillmentSummaryResponseDTO> getFulfillmentSummary(
            @RequestParam UUID companyId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        return ApiResponseFactory.success(
                "Resumo de atendimento das entregas obtido com sucesso",
                dashboardService.getFulfillmentSummary(companyId, from, to));
    }

    @GetMapping("/deliveries/timeline")
    public ApiResponse<DeliveryTimelineResponseDTO> getDeliveryTimeline(
            @RequestParam UUID companyId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) DeliveryTimelineGranularity granularity) {
        return ApiResponseFactory.success(
                "Linha do tempo de entregas obtida com sucesso",
                dashboardService.getDeliveryTimeline(companyId, from, to, granularity));
    }
}
