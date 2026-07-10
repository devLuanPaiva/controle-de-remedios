package com.devluanpaiva.controle_de_remedios.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidator implements ConstraintValidator<Cpf, String> {
    private static final int[] FIRST_CHECK_DIGIT_WEIGHTS = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
    private static final int[] SECOND_CHECK_DIGIT_WEIGHTS = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        if (cpf == null) {
            return true;
        }

        if (!cpf.matches("\\d{11}") || hasAllSameDigits(cpf)) {
            return false;
        }

        int[] digits = cpf.chars().map(digit -> digit - '0').toArray();

        if (calculateCheckDigit(digits, FIRST_CHECK_DIGIT_WEIGHTS) != digits[9]) {
            return false;
        }

        return calculateCheckDigit(digits, SECOND_CHECK_DIGIT_WEIGHTS) == digits[10];
    }

    private boolean hasAllSameDigits(String cpf) {
        return cpf.chars().distinct().count() == 1;
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
