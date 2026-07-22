package com.devluanpaiva.controle_de_remedios.modules.ai.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.BarcodeExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.ImageExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.MedicineNameExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiExtractionService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiExtractionController {
    private final AiExtractionService aiExtractionService;

    @PostMapping("/prescriptions/esus")
    public ApiResponse<PrescriptionExtractionResponseDTO> extractEsusPrescription(
            @RequestBody @Valid PrescriptionExtractionRequestDTO dto) {

        return ApiResponseFactory.success(
                "Extração da receita e-SUS concluída", aiExtractionService.extractEsusPrescription(dto));
    }

    @PostMapping("/prescriptions/digitalized")
    public ApiResponse<PrescriptionExtractionResponseDTO> extractDigitalizedPrescription(
            @RequestBody @Valid PrescriptionExtractionRequestDTO dto) {

        return ApiResponseFactory.success(
                "Extração da receita digitalizada concluída", aiExtractionService.extractDigitalizedPrescription(dto));
    }

    @PostMapping("/medicines/barcode")
    public ApiResponse<BarcodeExtractionResponseDTO> extractBarcode(
            @RequestBody @Valid ImageExtractionRequestDTO dto) {

        return ApiResponseFactory.success(
                "Leitura do código de barras concluída", aiExtractionService.extractBarcode(dto));
    }

    @PostMapping("/medicines/name")
    public ApiResponse<MedicineNameExtractionResponseDTO> extractMedicineName(
            @RequestBody @Valid ImageExtractionRequestDTO dto) {

        return ApiResponseFactory.success(
                "Leitura do nome do medicamento concluída", aiExtractionService.extractMedicineName(dto));
    }
}
