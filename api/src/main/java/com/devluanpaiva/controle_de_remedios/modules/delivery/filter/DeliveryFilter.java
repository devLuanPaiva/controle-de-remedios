package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

public record DeliveryFilter(
        UUID patientId,
        UUID medicineId) {
}
