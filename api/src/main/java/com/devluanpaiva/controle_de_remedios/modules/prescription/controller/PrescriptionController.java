package com.devluanpaiva.controle_de_remedios.modules.prescription.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.CreatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.UpdatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionFilter;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.PrescriptionService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PrescriptionResponseDTO> createPrescription(
            @RequestBody @Valid CreatePrescriptionRequestDTO dto) {
        return ApiResponseFactory.success("Receita criada com sucesso", prescriptionService.createPrescription(dto));
    }

    @GetMapping
    public ApiResponse<List<PrescriptionListItemResponseDTO>> getPrescriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String patientCpf,
            @RequestParam(required = false) PrescriptionStatus status,
            @RequestParam(required = false) LocalDate issueDate) {

        Pageable pageable = PageableFactory.build(page, size);
        PrescriptionFilter filter = new PrescriptionFilter(patientId, patientName, patientCpf, status, issueDate);
        Page<PrescriptionListItemResponseDTO> result = prescriptionService.getPrescriptions(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de receitas obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/{id}")
    public ApiResponse<PrescriptionDetailResponseDTO> getPrescriptionById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Receita encontrada com sucesso", prescriptionService.getPrescriptionById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<PrescriptionResponseDTO> updatePrescription(@PathVariable UUID id,
            @RequestBody @Valid UpdatePrescriptionRequestDTO dto) {
        return ApiResponseFactory.success(
                "Receita atualizada com sucesso", prescriptionService.updatePrescription(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePrescription(@PathVariable UUID id) {
        prescriptionService.deletePrescription(id);
        return ApiResponseFactory.success("Receita deletada com sucesso", null);
    }
}
