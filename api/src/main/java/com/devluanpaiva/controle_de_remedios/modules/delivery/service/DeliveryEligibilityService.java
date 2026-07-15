package com.devluanpaiva.controle_de_remedios.modules.delivery.service;

import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;

public interface DeliveryEligibilityService {
    void assertEligible(Patient patient, Medicine medicine);
}
