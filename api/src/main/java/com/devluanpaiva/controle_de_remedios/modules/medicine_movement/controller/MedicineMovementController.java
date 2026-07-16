package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.CreateMedicineMovementRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineBalanceResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineMovementResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter.MedicineMovementFilter;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/medicine-movements")
@RequiredArgsConstructor
public class MedicineMovementController {
    private final MedicineMovementService medicineMovementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MedicineMovementResponseDTO> registerReceived(
            @RequestBody @Valid CreateMedicineMovementRequestDTO dto) {
        return ApiResponseFactory.success(
                "Entrada de medicamento registrada com sucesso", medicineMovementService.registerReceived(dto));
    }

    @GetMapping
    public ApiResponse<List<MedicineMovementResponseDTO>> getMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID medicineId,
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        MedicineMovementFilter filter = new MedicineMovementFilter(medicineId, movementType, startDate, endDate);
        Page<MedicineMovementResponseDTO> result = medicineMovementService.listMovements(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de movementações obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/balance/{medicineId}")
    public ApiResponse<MedicineBalanceResponseDTO> getBalance(@PathVariable UUID medicineId) {
        return ApiResponseFactory.success(
                "Saldo do medicamento obtido com sucesso", medicineMovementService.getBalance(medicineId));
    }
}
