package com.devluanpaiva.controle_de_remedios.modules.delivery.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryService;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService deliveryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DeliveryResponseDTO> createDelivery(@RequestBody @Valid CreateDeliveryRequestDTO dto) {
        return ApiResponseFactory.success("Entrega registrada com sucesso", deliveryService.createDelivery(dto));
    }

    @GetMapping("/{id}")
    public ApiResponse<DeliveryResponseDTO> getDeliveryById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Entrega encontrada com sucesso", deliveryService.getDeliveryById(id));
    }

    @GetMapping
    public ApiResponse<List<DeliveryResponseDTO>> getDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID medicineId) {

        Pageable pageable = PageableFactory.build(page, size);
        DeliveryFilter filter = new DeliveryFilter(patientId, medicineId);
        Page<DeliveryResponseDTO> result = deliveryService.listDeliveries(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated("Lista de entregas obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/pending-queue/{medicineId}")
    public ApiResponse<List<PendingQueueItemResponseDTO>> getPendingQueue(@PathVariable UUID medicineId) {
        return ApiResponseFactory.list(
                "Fila de entregas pendentes obtida com sucesso", deliveryService.getPendingQueue(medicineId));
    }

    @PatchMapping("/reservations/{prescriptionItemId}")
    public ApiResponse<PrescriptionItemResponseDTO> reserveStock(
            @PathVariable UUID prescriptionItemId, @RequestBody @Valid ReserveStockRequestDTO dto) {
        return ApiResponseFactory.success(
                "Estoque reservado com sucesso", deliveryService.reserveStock(prescriptionItemId, dto));
    }
}
