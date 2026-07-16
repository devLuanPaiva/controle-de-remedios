package com.devluanpaiva.controle_de_remedios.modules.delivery.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID>, JpaSpecificationExecutor<Delivery> {
    boolean existsByPatient_IdAndPrescriptionItem_Medicine_IdAndNextAvailableDateAfter(
            UUID patientId, UUID medicineId, LocalDate date);

    Optional<Delivery> findTopByPatient_IdAndPrescriptionItem_Medicine_IdOrderByNextAvailableDateDesc(
            UUID patientId, UUID medicineId);
}
