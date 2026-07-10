package com.devluanpaiva.controle_de_remedios.modules.patient.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, UUID>, JpaSpecificationExecutor<Patient> {
    boolean existsByCompanyIdAndCpf(UUID companyId, String cpf);
}
