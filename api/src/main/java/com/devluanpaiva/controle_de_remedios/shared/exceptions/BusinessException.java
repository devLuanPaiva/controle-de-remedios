package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import org.springframework.http.HttpStatus;

public class BusinessException extends ApiException {

    public BusinessException(
            HttpStatus status,
            String message,
            String code,
            String field,
            String detail) {

        super(status, message, code, field, detail);
    }
}