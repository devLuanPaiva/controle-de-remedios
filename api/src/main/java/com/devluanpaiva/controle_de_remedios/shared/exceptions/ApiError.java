package com.devluanpaiva.controle_de_remedios.shared.exceptions;

public record ApiError(

        String code,

        String field,

        String detail) {
}
