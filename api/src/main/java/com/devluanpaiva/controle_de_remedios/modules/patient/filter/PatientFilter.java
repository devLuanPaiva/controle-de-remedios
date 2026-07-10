package com.devluanpaiva.controle_de_remedios.modules.patient.filter;

import java.util.UUID;

public record PatientFilter(
        UUID companyId,
        String name,
        String cpf) {
}
