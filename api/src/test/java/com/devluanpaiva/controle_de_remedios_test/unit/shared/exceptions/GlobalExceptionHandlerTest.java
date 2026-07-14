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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
            assertThat(response.getBody().errors().code()).isEqualTo("CNPJ_ALREADY_EXISTS");
            assertThat(response.getBody().errors().field()).isEqualTo("cnpj");
            assertThat(response.getBody().errors().detail())
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
        @DisplayName("should join multiple field errors with the expected separators")
        void shouldJoinMultipleFieldErrors() {
            BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "createCompanyRequestDTO");
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "name", "não deve estar em branco"));
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "cnpj", "CNPJ inválido"));

            MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
            when(exception.getBindingResult()).thenReturn(bindingResult);

            ResponseEntity<ApiExceptionResponse> response = handler.handleValidationException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().message()).isEqualTo("Erro de validação");
            assertThat(response.getBody().errors().code()).isEqualTo("VALIDATION_ERROR");
            assertThat(response.getBody().errors().field()).isEqualTo("name, cnpj");
            assertThat(response.getBody().errors().detail())
                    .isEqualTo("name: não deve estar em branco; cnpj: CNPJ inválido");
        }

        @Test
        @DisplayName("should format a single field error without a separator")
        void shouldFormatSingleFieldErrorWithoutSeparator() {
            BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "createCompanyRequestDTO");
            bindingResult.addError(new FieldError("createCompanyRequestDTO", "cnpj", "CNPJ inválido"));

            MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
            when(exception.getBindingResult()).thenReturn(bindingResult);

            ResponseEntity<ApiExceptionResponse> response = handler.handleValidationException(exception);

            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors().field()).isEqualTo("cnpj");
            assertThat(response.getBody().errors().detail()).isEqualTo("cnpj: CNPJ inválido");
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
            assertThat(response.getBody().errors().code()).isEqualTo("INVALID_PARAMETER");
            assertThat(response.getBody().errors().field()).isEqualTo("id");
            assertThat(response.getBody().errors().detail())
                    .isEqualTo("O valor 'abc' informado para 'id' é inválido. Era esperado um valor do tipo UUID.");
        }

        @Test
        @DisplayName("should not throw when the required type is unknown")
        void shouldNotThrowWhenRequiredTypeIsUnknown() throws NoSuchMethodException {
            MethodArgumentTypeMismatchException exception = buildException("abc", null);

            ResponseEntity<ApiExceptionResponse> response = handler.handleTypeMismatchException(exception);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().errors().detail()).contains("desconhecido");
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
            assertThat(response.getBody().errors().code()).isEqualTo("DATA_INTEGRITY_CONFLICT");
            assertThat(response.getBody().errors().field()).isNull();
            assertThat(response.getBody().errors().detail())
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
            assertThat(response.getBody().errors().code()).isEqualTo("INTERNAL_SERVER_ERROR");
            assertThat(response.getBody().errors().field()).isNull();
            assertThat(response.getBody().errors().detail())
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
