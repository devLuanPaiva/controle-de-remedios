package com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public interface PrescriptionItemFulfillmentAggregate {
    PrescriptionStatus getStatus();

    Long getCount();

    Long getDeliveredQuantityTotal();

    Long getPrescribedQuantityTotal();
}
