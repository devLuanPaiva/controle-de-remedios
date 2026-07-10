package com.devluanpaiva.controle_de_remedios.modules.patient.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientWithAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.UpdatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientFilter;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;

public interface PatientService {
    PatientResponseDTO createPatient(CreatePatientRequestDTO dto);

    PatientResponseDTO getPatientById(UUID id);

    Page<PatientResponseDTO> getPatients(PatientFilter filter, Pageable pageable);

    PatientResponseDTO updatePatient(UUID id, UpdatePatientRequestDTO dto);

    void deletePatient(UUID id);

    UserResponseDTO createPatientAccount(UUID patientId, CreatePatientAccountRequestDTO dto);

    PatientResponseDTO createPatientWithAccount(CreatePatientWithAccountRequestDTO dto);

    void removePatientAccount(UUID patientId);
}
