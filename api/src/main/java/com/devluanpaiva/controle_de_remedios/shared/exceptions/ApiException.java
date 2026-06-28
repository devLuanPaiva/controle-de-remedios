package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import lombok.Getter;

@Getter
public abstract class ApiException extends RuntimeException {
    private final int status;

    private final String code;

    private final String field;

    private final String detail;

    protected ApiException(
            int status,
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
