package com.devluanpaiva.controle_de_remedios_test.unit.shared.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.devluanpaiva.controle_de_remedios.shared.validation.CnpjValidator;

@DisplayName("CnpjValidator")
class CnpjValidatorTest {

    private final CnpjValidator validator = new CnpjValidator();

    @Test
    @DisplayName("should accept a null value, deferring to @NotBlank/@NotNull")
    void shouldAcceptNull() {
        assertThat(validator.isValid(null, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = { "11222333000181", "11444777000161" })
    @DisplayName("should accept a CNPJ with correct check digits")
    void shouldAcceptValidCnpj(String cnpj) {
        assertThat(validator.isValid(cnpj, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "11222333000180",
            "1122233300018",
            "112223330001811",
            "1122233300018a",
            "00000000000000",
            "11111111111111"
    })
    @DisplayName("should reject wrong check digits, wrong length, non-numeric input and repeated-digit sequences")
    void shouldRejectInvalidCnpj(String cnpj) {
        assertThat(validator.isValid(cnpj, null)).isFalse();
    }
}
