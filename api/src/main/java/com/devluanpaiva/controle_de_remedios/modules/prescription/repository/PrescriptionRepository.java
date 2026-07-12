package com.devluanpaiva.controle_de_remedios.modules.prescription.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, UUID>, JpaSpecificationExecutor<Prescription> {
}
