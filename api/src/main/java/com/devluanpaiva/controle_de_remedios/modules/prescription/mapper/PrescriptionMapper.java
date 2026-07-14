package com.devluanpaiva.controle_de_remedios.modules.prescription.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionPatientSummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PrescriptionMapper {
    private final PatientMapper patientMapper;
    private final PrescriptionItemMapper prescriptionItemMapper;

    public PrescriptionResponseDTO toResponseDTO(Prescription prescription) {
        return new PrescriptionResponseDTO(
                prescription.getId(),
                prescription.getStatus(),
                List.copyOf(prescription.getImageUrls()),
                prescription.getIssueDate(),
                prescription.getPatient().getId(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt());
    }

    public PrescriptionDetailResponseDTO toDetailResponseDTO(Prescription prescription) {
        return new PrescriptionDetailResponseDTO(
                prescription.getId(),
                prescription.getStatus(),
                List.copyOf(prescription.getImageUrls()),
                prescription.getIssueDate(),
                prescription.getPatient().getId(),
                patientMapper.toResponseDTO(prescription.getPatient()),
                prescription.getItems().stream().map(prescriptionItemMapper::toResponseDTO).toList(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt());
    }

    public PrescriptionListItemResponseDTO toListItemResponseDTO(Prescription prescription) {
        Patient patient = prescription.getPatient();

        return new PrescriptionListItemResponseDTO(
                prescription.getId(),
                prescription.getStatus(),
                List.copyOf(prescription.getImageUrls()),
                prescription.getIssueDate(),
                patient.getId(),
                new PrescriptionPatientSummaryDTO(patient.getId(), patient.getName()),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt());
    }
}
