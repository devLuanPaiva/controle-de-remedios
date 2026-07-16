package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;

public interface MovementTypeTotal {
    MovementType getMovementType();

    Long getTotal();
}
