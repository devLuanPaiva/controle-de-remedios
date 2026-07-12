package com.devluanpaiva.controle_de_remedios.modules.prescription.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.CreatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.UpdatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionFilter;

public interface PrescriptionService {
    PrescriptionResponseDTO createPrescription(CreatePrescriptionRequestDTO dto);

    PrescriptionDetailResponseDTO getPrescriptionById(UUID id);

    Page<PrescriptionListItemResponseDTO> getPrescriptions(PrescriptionFilter filter, Pageable pageable);

    PrescriptionResponseDTO updatePrescription(UUID id, UpdatePrescriptionRequestDTO dto);

    void deletePrescription(UUID id);
}
