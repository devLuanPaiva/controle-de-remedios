package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import java.util.List;

public record ApiExceptionResponse(

        String status,

        String message,

        Object data,

        List<ApiError> errors) {
}