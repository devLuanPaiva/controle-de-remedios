package com.devluanpaiva.controle_de_remedios.modules.ai.service;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.BarcodeExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.ImageExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.MedicineNameExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionResponseDTO;

public interface AiExtractionService {
    PrescriptionExtractionResponseDTO extractEsusPrescription(PrescriptionExtractionRequestDTO dto);

    PrescriptionExtractionResponseDTO extractDigitalizedPrescription(PrescriptionExtractionRequestDTO dto);

    BarcodeExtractionResponseDTO extractBarcode(ImageExtractionRequestDTO dto);

    MedicineNameExtractionResponseDTO extractMedicineName(ImageExtractionRequestDTO dto);
}
