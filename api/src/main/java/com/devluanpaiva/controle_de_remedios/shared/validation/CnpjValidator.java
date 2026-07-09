package com.devluanpaiva.controle_de_remedios.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpjValidator implements ConstraintValidator<Cnpj, String> {
    private static final int[] FIRST_CHECK_DIGIT_WEIGHTS = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
    private static final int[] SECOND_CHECK_DIGIT_WEIGHTS = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

    @Override
    public boolean isValid(String cnpj, ConstraintValidatorContext context) {
        if (cnpj == null) {
            return true;
        }

        if (!cnpj.matches("\\d{14}") || hasAllSameDigits(cnpj)) {
            return false;
        }

        int[] digits = cnpj.chars().map(digit -> digit - '0').toArray();

        if (calculateCheckDigit(digits, FIRST_CHECK_DIGIT_WEIGHTS) != digits[12]) {
            return false;
        }

        return calculateCheckDigit(digits, SECOND_CHECK_DIGIT_WEIGHTS) == digits[13];
    }

    private boolean hasAllSameDigits(String cnpj) {
        return cnpj.chars().distinct().count() == 1;
    }

    private int calculateCheckDigit(int[] digits, int[] weights) {
        int sum = 0;

        for (int i = 0; i < weights.length; i++) {
            sum += digits[i] * weights[i];
        }

        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
