package com.devluanpaiva.controle_de_remedios.shared.exceptions;

public record ApiExceptionResponse(

        String status,

        String message,

        Object data,

        ApiError errors) {
}