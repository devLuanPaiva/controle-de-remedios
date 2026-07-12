package com.devluanpaiva.controle_de_remedios.modules.prescription.filter;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public record PrescriptionFilter(
        UUID patientId,
        String patientName,
        String patientCpf,
        PrescriptionStatus status,
        LocalDate issueDate) {
}
