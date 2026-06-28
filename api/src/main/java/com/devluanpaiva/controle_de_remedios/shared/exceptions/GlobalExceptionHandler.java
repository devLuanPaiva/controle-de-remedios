package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiExceptionResponse> handleApiException(ApiException ex) {

        ApiExceptionResponse response =
                new ApiExceptionResponse(
                        "error",
                        ex.getMessage(),
                        null,
                        new ApiError(
                                ex.getCode(),
                                ex.getField(),
                                ex.getDetail()));

        return ResponseEntity
                .status(ex.getStatus())
                .body(response);
    }
}
