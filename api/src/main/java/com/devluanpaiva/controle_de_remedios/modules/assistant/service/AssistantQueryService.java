package com.devluanpaiva.controle_de_remedios.modules.assistant.service;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.DeliverySummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.PatientDeliveriesResponseDTO;

public interface AssistantQueryService {
    DeliverySummaryResponseDTO getDeliveriesSummary(UUID companyId);

    PatientDeliveriesResponseDTO getPatientDeliveries(UUID companyId, String patientName);
}
