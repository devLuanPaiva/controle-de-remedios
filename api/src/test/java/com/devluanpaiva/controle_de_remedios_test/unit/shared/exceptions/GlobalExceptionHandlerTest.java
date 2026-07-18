package com.devluanpaiva.controle_de_remedios_test.unit.shared.exceptions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiExceptionResponse;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.GlobalExceptionHandler;

@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Nested
    @DisplayName("handleApiException")
    class HandleApiException {

        @Test
        @DisplayName("should translate a BusinessException into its own status, code, field and detail")
        void shouldTranslateBusinessExceptionIntoResponse() {
            BusinessException exception = new BusinessException(
                    HttpStatus.CONFLICT, "CNPJ já cadastrado", "CNPJ_ALREADY_EXISTS", "cnpj",
                    "Já existe uma empresa cadastrada com o CNPJ '11222333000181'.");

            ResponseEntity<ApiExceptionResponse> response = handler.handleApiException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().status()).isEqualTo("error");
            assertThat(response.getBody().message()).isEqualTo("CNPJ já cadastrado");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("CNPJ_ALREADY_EXISTS");
            assertThat(response.getBody().errors().get(0).field()).isEqualTo("cnpj");
            assertThat(response.getBody().errors().get(0).detail())
                    .isEqualTo("Já existe uma empresa cadastrada com o CNPJ '11222333000181'.");
        }

        @Test
        @DisplayName("should use the exception's own HTTP status instead of a hardcoded one")
        void shouldUseExceptionOwnStatus() {
            BusinessException exception = new BusinessException(
                    HttpStatus.FORBIDDEN, "Acesso negado", "AUTH_FORBIDDEN", "authorization",
                    "Você não possui permissão para executar esta ação.");

            ResponseEntity<ApiExceptionResponse> response = handler.handleApiException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    @Nested
    @DisplayName("handleValidationException")
    class HandleValidationException {

        @Test
        @DisplayName("should return one ApiError per field error, preserving each field and message")
        void shouldReturnOneApiErrorPerFieldError() {
            BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "createCompanyRequestDTO");
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "name", "não deve estar em branco"));
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "cnpj", "CNPJ inválido"));

            MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
            when(exception.getBindingResult()).thenReturn(bindingResult);

            ResponseEntity<ApiExceptionResponse> response = handler.handleValidationException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Erro de validação");
            assertThat(response.getBody().errors()).hasSize(2);

            assertThat(response.getBody().errors().get(0).code()).isEqualTo("VALIDATION_ERROR");
            assertThat(response.getBody().errors().get(0).field()).isEqualTo("name");
            assertThat(response.getBody().errors().get(0).detail()).isEqualTo("não deve estar em branco");

            assertThat(response.getBody().errors().get(1).code()).isEqualTo("VALIDATION_ERROR");
            assertThat(response.getBody().errors().get(1).field()).isEqualTo("cnpj");
            assertThat(response.getBody().errors().get(1).detail()).isEqualTo("CNPJ inválido");
        }

        @Test
        @DisplayName("should return a single-element list for a single field error")
        void shouldReturnSingleElementListForSingleFieldError() {
            BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "createCompanyRequestDTO");
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "cnpj", "CNPJ inválido"));

            MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
            when(exception.getBindingResult()).thenReturn(bindingResult);

            ResponseEntity<ApiExceptionResponse> response = handler.handleValidationException(exception);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).field()).isEqualTo("cnpj");
            assertThat(response.getBody().errors().get(0).detail()).isEqualTo("CNPJ inválido");
        }
    }

    @Nested
    @DisplayName("handleTypeMismatchException")
    class HandleTypeMismatchException {

        @SuppressWarnings("unused")
        private void dummyEndpoint(UUID id) {
        }

        private MethodArgumentTypeMismatchException buildException(Object value, Class<?> requiredType)
                throws NoSuchMethodException {
            Method method = GlobalExceptionHandlerTest.HandleTypeMismatchException.class
                    .getDeclaredMethod("dummyEndpoint", UUID.class);
            MethodParameter methodParameter = new MethodParameter(method, 0);

            return new MethodArgumentTypeMismatchException(
                    value, requiredType, "id", methodParameter, new IllegalArgumentException("invalid UUID"));
        }

        @Test
        @DisplayName("should return 400 naming the offending parameter and the expected type")
        void shouldReturnBadRequestNamingParameterAndExpectedType() throws NoSuchMethodException {
            MethodArgumentTypeMismatchException exception = buildException("abc", UUID.class);

            ResponseEntity<ApiExceptionResponse> response = handler.handleTypeMismatchException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Parâmetro inválido");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("INVALID_PARAMETER");
            assertThat(response.getBody().errors().get(0).field()).isEqualTo("id");
            assertThat(response.getBody().errors().get(0).detail())
                    .isEqualTo("O valor 'abc' informado para 'id' é inválido. Era esperado um valor do tipo UUID.");
        }

        @Test
        @DisplayName("should not throw when the required type is unknown")
        void shouldNotThrowWhenRequiredTypeIsUnknown() throws NoSuchMethodException {
            MethodArgumentTypeMismatchException exception = buildException("abc", null);

            ResponseEntity<ApiExceptionResponse> response = handler.handleTypeMismatchException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors().get(0).detail()).contains("desconhecido");
        }
    }

    @Nested
    @DisplayName("handleMissingParameterException")
    class HandleMissingParameterException {

        @Test
        @DisplayName("should return 400 naming the missing parameter")
        void shouldReturnBadRequestNamingMissingParameter() {
            MissingServletRequestParameterException exception = new MissingServletRequestParameterException(
                    "companyId", "UUID");

            ResponseEntity<ApiExceptionResponse> response = handler.handleMissingParameterException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Parâmetro obrigatório ausente");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("MISSING_PARAMETER");
            assertThat(response.getBody().errors().get(0).field()).isEqualTo("companyId");
            assertThat(response.getBody().errors().get(0).detail()).isEqualTo("O parâmetro 'companyId' é obrigatório.");
        }
    }

    @Nested
    @DisplayName("handleMessageNotReadableException")
    class HandleMessageNotReadableException {

        @Test
        @DisplayName("should return 400 without leaking the raw parser message")
        void shouldReturnBadRequestWithoutLeakingRawParserMessage() {
            HttpMessageNotReadableException exception = new HttpMessageNotReadableException(
                    "JSON parse error: Unexpected character", mock(HttpInputMessage.class));

            ResponseEntity<ApiExceptionResponse> response = handler.handleMessageNotReadableException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Requisição inválida");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("MALFORMED_REQUEST_BODY");
            assertThat(response.getBody().errors().get(0).detail()).doesNotContain("JSON parse error");
        }
    }

    @Nested
    @DisplayName("handleMethodNotSupportedException")
    class HandleMethodNotSupportedException {

        @Test
        @DisplayName("should return 405 naming the offending method")
        void shouldReturnMethodNotAllowedNamingMethod() {
            HttpRequestMethodNotSupportedException exception = new HttpRequestMethodNotSupportedException("PUT");

            ResponseEntity<ApiExceptionResponse> response = handler.handleMethodNotSupportedException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("METHOD_NOT_ALLOWED");
            assertThat(response.getBody().errors().get(0).detail()).contains("PUT");
        }
    }

    @Nested
    @DisplayName("handleMediaTypeNotSupportedException")
    class HandleMediaTypeNotSupportedException {

        @Test
        @DisplayName("should return 415")
        void shouldReturnUnsupportedMediaType() {
            HttpMediaTypeNotSupportedException exception = new HttpMediaTypeNotSupportedException(
                    MediaType.TEXT_PLAIN, java.util.List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<ApiExceptionResponse> response = handler.handleMediaTypeNotSupportedException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("UNSUPPORTED_MEDIA_TYPE");
        }
    }

    @Nested
    @DisplayName("handleNoResourceFoundException")
    class HandleNoResourceFoundException {

        @Test
        @DisplayName("should return 404")
        void shouldReturnNotFound() {
            NoResourceFoundException exception = new NoResourceFoundException(
                    HttpMethod.GET, "/unknown-route", "No static resource unknown-route.");

            ResponseEntity<ApiExceptionResponse> response = handler.handleNoResourceFoundException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("handleDataIntegrityViolation")
    class HandleDataIntegrityViolation {

        @Test
        @DisplayName("should return 409 with a generic message, without leaking the raw database error")
        void shouldReturnConflictWithGenericMessage() {
            DataIntegrityViolationException exception = new DataIntegrityViolationException(
                    "could not execute statement; SQL [insert into companies ...]; "
                            + "constraint [uk_companies_cnpj]");

            ResponseEntity<ApiExceptionResponse> response = handler.handleDataIntegrityViolation(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().status()).isEqualTo("error");
            assertThat(response.getBody().message()).isEqualTo("Conflito de dados");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("DATA_INTEGRITY_CONFLICT");
            assertThat(response.getBody().errors().get(0).field()).isNull();
            assertThat(response.getBody().errors().get(0).detail())
                    .isEqualTo("Os dados informados conflitam com um registro já existente.")
                    .doesNotContain("uk_companies_cnpj")
                    .doesNotContain("SQL");
        }

        @Test
        @DisplayName("should not throw when the exception has no message or cause")
        void shouldNotThrowWhenExceptionHasNoMessage() {
            DataIntegrityViolationException exception = new DataIntegrityViolationException((String) null);

            ResponseEntity<ApiExceptionResponse> response = handler.handleDataIntegrityViolation(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
        }
    }

    @Nested
    @DisplayName("handleGenericException")
    class HandleGenericException {

        @Test
        @DisplayName("should return 500 with a generic message, without leaking the original exception message")
        void shouldReturnInternalServerErrorWithGenericMessage() {
            RuntimeException exception = new RuntimeException("Connection refused: db-primary.internal:5432");

            ResponseEntity<ApiExceptionResponse> response = handler.handleGenericException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().status()).isEqualTo("error");
            assertThat(response.getBody().message()).isEqualTo("Erro interno do servidor");
            assertThat(response.getBody().errors()).hasSize(1);
            assertThat(response.getBody().errors().get(0).code()).isEqualTo("INTERNAL_SERVER_ERROR");
            assertThat(response.getBody().errors().get(0).field()).isNull();
            assertThat(response.getBody().errors().get(0).detail())
                    .isEqualTo("Ocorreu um erro inesperado. Tente novamente mais tarde.")
                    .doesNotContain("db-primary.internal");
        }

        @Test
        @DisplayName("should not throw when the exception has no message")
        void shouldNotThrowWhenExceptionHasNoMessage() {
            RuntimeException exception = new RuntimeException();

            ResponseEntity<ApiExceptionResponse> response = handler.handleGenericException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
