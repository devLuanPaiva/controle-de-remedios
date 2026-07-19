package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

public record PendingDeliveryItemFilter(
        UUID companyId,
        String patientName,
        String patientCpf) {
}
