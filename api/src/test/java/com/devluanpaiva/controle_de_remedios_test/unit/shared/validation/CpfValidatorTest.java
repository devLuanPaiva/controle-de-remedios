package com.devluanpaiva.controle_de_remedios_test.unit.shared.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.devluanpaiva.controle_de_remedios.shared.validation.CpfValidator;

@DisplayName("CpfValidator")
class CpfValidatorTest {

    private final CpfValidator validator = new CpfValidator();

    @Test
    @DisplayName("should accept a null value, deferring to @NotBlank/@NotNull")
    void shouldAcceptNull() {
        assertThat(validator.isValid(null, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = { "11144477735", "52998224725" })
    @DisplayName("should accept a CPF with correct check digits")
    void shouldAcceptValidCpf(String cpf) {
        assertThat(validator.isValid(cpf, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "11144477736",
            "1114447773",
            "111444777350",
            "1114447773a",
            "00000000000",
            "11111111111"
    })
    @DisplayName("should reject wrong check digits, wrong length, non-numeric input and repeated-digit sequences")
    void shouldRejectInvalidCpf(String cpf) {
        assertThat(validator.isValid(cpf, null)).isFalse();
    }
}
