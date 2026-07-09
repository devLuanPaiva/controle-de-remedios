package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ApiException.class)
        public ResponseEntity<ApiExceptionResponse> handleApiException(ApiException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
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

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiExceptionResponse> handleValidationException(MethodArgumentNotValidException ex) {

                String field = ex.getBindingResult().getFieldErrors().stream()
                                .map(FieldError::getField)
                                .collect(Collectors.joining(", "));

                String detail = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .collect(Collectors.joining("; "));

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Erro de validação",
                                null,
                                new ApiError("VALIDATION_ERROR", field, detail));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiExceptionResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex) {

                String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconhecido";

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Parâmetro inválido",
                                null,
                                new ApiError(
                                                "INVALID_PARAMETER",
                                                ex.getName(),
                                                "O valor '" + ex.getValue() + "' informado para '" + ex.getName()
                                                                + "' é inválido. Era esperado um valor do tipo " + requiredType + "."));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiExceptionResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
                log.warn("Violação de integridade de dados", ex);

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Conflito de dados",
                                null,
                                new ApiError(
                                                "DATA_INTEGRITY_CONFLICT",
                                                null,
                                                "Os dados informados conflitam com um registro já existente."));

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(response);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiExceptionResponse> handleGenericException(Exception ex) {
                log.error("Erro inesperado ao processar a requisição", ex);

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Erro interno do servidor",
                                null,
                                new ApiError(
                                                "INTERNAL_SERVER_ERROR",
                                                null,
                                                "Ocorreu um erro inesperado. Tente novamente mais tarde."));

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(response);
        }
}
