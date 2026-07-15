package com.devluanpaiva.controle_de_remedios.modules.medicine.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.CreateMedicineRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineService medicineService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MedicineResponseDTO> createMedicine(@RequestBody @Valid CreateMedicineRequestDTO dto) {
        return ApiResponseFactory.success("Medicamento criado com sucesso", medicineService.createMedicine(dto));
    }

    @GetMapping("/{id}")
    public ApiResponse<MedicineResponseDTO> getMedicineById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Medicamento encontrado com sucesso", medicineService.getMedicineById(id));
    }
}
