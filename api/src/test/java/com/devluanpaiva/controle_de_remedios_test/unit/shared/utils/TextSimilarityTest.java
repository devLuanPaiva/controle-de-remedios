package com.devluanpaiva.controle_de_remedios_test.unit.shared.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.devluanpaiva.controle_de_remedios.shared.utils.TextSimilarity;

@DisplayName("TextSimilarity")
class TextSimilarityTest {

    private static final double THRESHOLD = 0.85;

    @Test
    @DisplayName("should return true for identical strings")
    void shouldReturnTrueForIdenticalStrings() {
        assertThat(TextSimilarity.isSimilar("Dipirona", "Dipirona", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should return true for a case-insensitive match")
    void shouldReturnTrueForCaseInsensitiveMatch() {
        assertThat(TextSimilarity.isSimilar("Dipirona", "DIPIRONA", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should return true for an accent-insensitive match")
    void shouldReturnTrueForAccentInsensitiveMatch() {
        assertThat(TextSimilarity.isSimilar("Ibuprofeno", "Ibuprofêno", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should ignore special characters during normalization")
    void shouldIgnoreSpecialCharactersDuringNormalization() {
        assertThat(TextSimilarity.isSimilar("Dipirona-500mg", "Dipirona 500mg", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should collapse extra whitespace during normalization")
    void shouldCollapseExtraWhitespaceDuringNormalization() {
        assertThat(TextSimilarity.isSimilar("Dipirona   500mg", "Dipirona 500mg", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should treat a hyphen the same as a space even for short names")
    void shouldTreatHyphenAsSpaceForShortNames() {
        assertThat(TextSimilarity.isSimilar("Mag-B", "Mag B", THRESHOLD)).isTrue();
    }

    @Test
    @DisplayName("should return false for completely different strings")
    void shouldReturnFalseForCompletelyDifferentStrings() {
        assertThat(TextSimilarity.isSimilar("Dipirona", "Paracetamol", THRESHOLD)).isFalse();
    }

    @Test
    @DisplayName("should return false without throwing when either string is null")
    void shouldReturnFalseWhenEitherStringIsNull() {
        assertThat(TextSimilarity.isSimilar(null, "Dipirona", THRESHOLD)).isFalse();
        assertThat(TextSimilarity.isSimilar("Dipirona", null, THRESHOLD)).isFalse();
    }

    @Test
    @DisplayName("should return false when either string normalizes to empty")
    void shouldReturnFalseWhenEitherStringNormalizesToEmpty() {
        assertThat(TextSimilarity.isSimilar("   ", "Dipirona", THRESHOLD)).isFalse();
        assertThat(TextSimilarity.isSimilar("!!!", "Dipirona", THRESHOLD)).isFalse();
    }

    @Test
    @DisplayName("should include the threshold boundary as similar (inclusive comparison)")
    void shouldIncludeTheThresholdBoundaryAsSimilar() {
        // "aaaa" vs "aaab": Levenshtein distance 1, max length 4 -> ratio exactly 0.75
        assertThat(TextSimilarity.isSimilar("aaaa", "aaab", 0.75)).isTrue();
    }

    @Test
    @DisplayName("should exclude strings whose ratio falls just below the threshold")
    void shouldExcludeStringsJustBelowThreshold() {
        // Same pair as above (ratio 0.75), now requiring a threshold it cannot reach
        assertThat(TextSimilarity.isSimilar("aaaa", "aaab", 0.76)).isFalse();
    }
}
