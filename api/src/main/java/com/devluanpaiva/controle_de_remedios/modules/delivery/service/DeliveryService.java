package com.devluanpaiva.controle_de_remedios.modules.delivery.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;

public interface DeliveryService {
    DeliveryResponseDTO createDelivery(CreateDeliveryRequestDTO dto);

    PrescriptionItemResponseDTO reserveStock(UUID prescriptionItemId, ReserveStockRequestDTO dto);

    DeliveryResponseDTO getDeliveryById(UUID id);

    Page<DeliveryResponseDTO> listDeliveries(DeliveryFilter filter, Pageable pageable);

    List<PendingQueueItemResponseDTO> getPendingQueue(UUID medicineId);
}
