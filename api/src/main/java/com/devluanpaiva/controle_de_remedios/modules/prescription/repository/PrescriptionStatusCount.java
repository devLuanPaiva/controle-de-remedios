package com.devluanpaiva.controle_de_remedios.modules.prescription.repository;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public interface PrescriptionStatusCount {
    PrescriptionStatus getStatus();

    Long getCount();
}
