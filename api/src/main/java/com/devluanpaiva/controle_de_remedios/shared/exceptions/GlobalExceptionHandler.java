package com.devluanpaiva.controle_de_remedios.shared.exceptions;

import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiExceptionResponse> handleMissingParameterException(
                        MissingServletRequestParameterException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Parâmetro obrigatório ausente",
                                null,
                                new ApiError(
                                                "MISSING_PARAMETER",
                                                ex.getParameterName(),
                                                "O parâmetro '" + ex.getParameterName() + "' é obrigatório."));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiExceptionResponse> handleMessageNotReadableException(
                        HttpMessageNotReadableException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Requisição inválida",
                                null,
                                new ApiError(
                                                "MALFORMED_REQUEST_BODY",
                                                null,
                                                "O corpo da requisição está ausente ou mal formatado."));

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiExceptionResponse> handleMethodNotSupportedException(
                        HttpRequestMethodNotSupportedException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Método não permitido",
                                null,
                                new ApiError(
                                                "METHOD_NOT_ALLOWED",
                                                null,
                                                "O método '" + ex.getMethod() + "' não é suportado para este recurso."));

                return ResponseEntity
                                .status(HttpStatus.METHOD_NOT_ALLOWED)
                                .body(response);
        }

        @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
        public ResponseEntity<ApiExceptionResponse> handleMediaTypeNotSupportedException(
                        HttpMediaTypeNotSupportedException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Tipo de mídia não suportado",
                                null,
                                new ApiError(
                                                "UNSUPPORTED_MEDIA_TYPE",
                                                "Content-Type",
                                                "O tipo de conteúdo informado não é suportado por este recurso."));

                return ResponseEntity
                                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                                .body(response);
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<ApiExceptionResponse> handleNoResourceFoundException(NoResourceFoundException ex) {

                ApiExceptionResponse response = new ApiExceptionResponse(
                                "error",
                                "Recurso não encontrado",
                                null,
                                new ApiError(
                                                "NOT_FOUND",
                                                null,
                                                "Não foi possível encontrar o recurso solicitado."));

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
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
