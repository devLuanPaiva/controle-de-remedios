package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public abstract class ApiException extends RuntimeException {
    private final HttpStatus status;

    private final String code;

    private final String field;

    private final String detail;

    protected ApiException(
            HttpStatus status,
            String message,
            String code,
            String field,
            String detail) {

        super(message);

        this.status = status;
        this.code = code;
        this.field = field;
        this.detail = detail;
    }
}
