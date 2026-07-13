package com.devluanpaiva.controle_de_remedios.modules.prescription_item.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.UpdatePrescriptionItemRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.service.PrescriptionItemService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/prescription-items")
@RequiredArgsConstructor
public class PrescriptionItemController {
    private final PrescriptionItemService prescriptionItemService;

    @GetMapping("/{id}")
    public ApiResponse<PrescriptionItemResponseDTO> getPrescriptionItemById(@PathVariable UUID id) {
        return ApiResponseFactory.success(
                "Item de receita encontrado com sucesso", prescriptionItemService.getPrescriptionItemById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<PrescriptionItemResponseDTO> updatePrescriptionItem(@PathVariable UUID id,
            @RequestBody @Valid UpdatePrescriptionItemRequestDTO dto) {
        return ApiResponseFactory.success(
                "Item de receita atualizado com sucesso", prescriptionItemService.updatePrescriptionItem(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePrescriptionItem(@PathVariable UUID id) {
        prescriptionItemService.deletePrescriptionItem(id);
        return ApiResponseFactory.success("Item de receita deletado com sucesso", null);
    }
}
