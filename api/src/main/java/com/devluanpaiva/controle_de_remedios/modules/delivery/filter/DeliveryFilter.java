package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

public record DeliveryFilter(
        UUID companyId,
        UUID patientId,
        UUID medicineId,
        String medicineName,
        String patientName,
        String patientEmail,
        String patientCpf) {
}
