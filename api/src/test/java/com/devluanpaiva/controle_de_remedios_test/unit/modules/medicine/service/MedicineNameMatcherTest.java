package com.devluanpaiva.controle_de_remedios_test.unit.modules.medicine.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineNameMatcher;

@DisplayName("MedicineNameMatcher")
class MedicineNameMatcherTest {

    @Test
    @DisplayName("should match identical names")
    void shouldMatchIdenticalNames() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "ACETATO DE MEDROXIPROGESTERONA 150MG")).isTrue();
    }

    @Test
    @DisplayName("should match when the dosage is missing entirely")
    void shouldMatchWhenDosageIsMissingEntirely() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "ACETATO DE MEDROXIPROGESTERONA")).isTrue();
    }

    @Test
    @DisplayName("should match when the dosage unit (mg) is missing")
    void shouldMatchWhenDosageUnitIsMissing() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "ACETATO DE MEDROXIPROGESTERONA 150")).isTrue();
    }

    @Test
    @DisplayName("should match when a qualifier stopword (de) is missing")
    void shouldMatchWhenQualifierStopwordIsMissing() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "ACETATO MEDROXIPROGESTERONA 150MG")).isTrue();
    }

    @Test
    @DisplayName("should match when a leading qualifier word (acetato de) is missing")
    void shouldMatchWhenLeadingQualifierWordsAreMissing() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", " MEDROXIPROGESTERONA 150MG")).isTrue();
    }

    @Test
    @DisplayName("should not match the same substance at a different dosage")
    void shouldNotMatchSameSubstanceAtDifferentDosage() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "ACETATO DE MEDROXIPROGESTERONA 250MG")).isFalse();
    }

    @Test
    @DisplayName("should not match a different active substance despite a shared qualifier word")
    void shouldNotMatchDifferentActiveSubstance() {
        assertThat(MedicineNameMatcher.isSimilar(
                "ACETATO DE MEDROXIPROGESTERONA 150MG", "Acetato de Dexametasona")).isFalse();
    }

    @Test
    @DisplayName("should return false when either name is blank")
    void shouldReturnFalseWhenEitherNameIsBlank() {
        assertThat(MedicineNameMatcher.isSimilar("", "ACETATO DE MEDROXIPROGESTERONA 150MG")).isFalse();
        assertThat(MedicineNameMatcher.isSimilar("ACETATO DE MEDROXIPROGESTERONA 150MG", "")).isFalse();
    }

    @Test
    @DisplayName("longestSignificantWord should pick the longest non-stopword, non-dosage token")
    void longestSignificantWordShouldPickTheLongestToken() {
        assertThat(MedicineNameMatcher.longestSignificantWord("ACETATO DE MEDROXIPROGESTERONA 150MG"))
                .isEqualTo("medroxiprogesterona");
    }

    @Test
    @DisplayName("longestSignificantWord should return empty when there is no significant word")
    void longestSignificantWordShouldReturnEmptyWhenThereIsNoSignificantWord() {
        assertThat(MedicineNameMatcher.longestSignificantWord("150 mg")).isEmpty();
        assertThat(MedicineNameMatcher.longestSignificantWord("")).isEmpty();
    }
}
