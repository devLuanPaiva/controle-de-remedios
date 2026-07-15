package com.devluanpaiva.controle_de_remedios.modules.prescription.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, UUID>, JpaSpecificationExecutor<Prescription> {
    List<Prescription> findByPatient_IdAndStatusInOrderByIssueDateDesc(UUID patientId, List<PrescriptionStatus> statuses);
}
