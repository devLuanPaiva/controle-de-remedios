package com.devluanpaiva.controle_de_remedios.modules.assistant.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.DeliverySummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.PatientDeliveriesResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.AssistantQueryService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/assistant")
@RequiredArgsConstructor
public class AssistantInternalController {
    private final AssistantQueryService assistantQueryService;

    @GetMapping("/deliveries-summary")
    public ApiResponse<DeliverySummaryResponseDTO> getDeliveriesSummary(@RequestParam UUID companyId) {
        return ApiResponseFactory.success(
                "Resumo de entregas obtido com sucesso", assistantQueryService.getDeliveriesSummary(companyId));
    }

    @GetMapping("/patient-deliveries")
    public ApiResponse<PatientDeliveriesResponseDTO> getPatientDeliveries(
            @RequestParam UUID companyId, @RequestParam String patientName) {

        return ApiResponseFactory.success(
                "Entregas do paciente obtidas com sucesso",
                assistantQueryService.getPatientDeliveries(companyId, patientName));
    }
}
