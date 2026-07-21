package com.devluanpaiva.controle_de_remedios.modules.delivery.repository;

import java.time.LocalDate;

public interface DeliveryDailyAggregate {
    LocalDate getDeliveryDate();

    Long getDeliveriesCount();

    Long getQuantityTotal();
}
