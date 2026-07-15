package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryEligibilityService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryEligibilityServiceImpl implements DeliveryEligibilityService {
    private final DeliveryRepository deliveryRepository;

    @Override
    public void assertEligible(Patient patient, Medicine medicine) {
        boolean stillInTreatmentPeriod = deliveryRepository
                .existsByPatient_IdAndPrescriptionItem_Medicine_IdAndNextAvailableDateAfter(
                        patient.getId(), medicine.getId(), LocalDate.now());

        if (!stillInTreatmentPeriod) {
            return;
        }

        LocalDate nextAvailableDate = deliveryRepository
                .findTopByPatient_IdAndPrescriptionItem_Medicine_IdOrderByNextAvailableDateDesc(
                        patient.getId(), medicine.getId())
                .map(Delivery::getNextAvailableDate)
                .orElseThrow();

        throw new BusinessException(
                HttpStatus.CONFLICT,
                "Remédio ainda está no prazo de tratamento anterior",
                "MEDICINE_STILL_IN_TREATMENT_PERIOD",
                "medicineId",
                "O remédio '" + medicine.getName() + "' só estará disponível novamente em " + nextAvailableDate
                        + ".");
    }
}
