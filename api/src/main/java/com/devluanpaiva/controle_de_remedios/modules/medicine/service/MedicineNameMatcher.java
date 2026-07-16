package com.devluanpaiva.controle_de_remedios.modules.medicine.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.devluanpaiva.controle_de_remedios.shared.utils.TextSimilarity;

public final class MedicineNameMatcher {
    private static final double WORD_SIMILARITY_THRESHOLD = 0.85;
    private static final Set<String> IGNORED_WORDS = Set.of(
            "de", "da", "do", "das", "dos",
            "mg", "mcg", "g", "kg", "ml", "l", "ui", "un");
    private static final Pattern DIGITS = Pattern.compile("\\d+");

    private MedicineNameMatcher() {
    }

    public static boolean isSimilar(String first, String second) {
        List<String> firstWords = significantWords(first);
        List<String> secondWords = significantWords(second);

        if (firstWords.isEmpty() || secondWords.isEmpty()) {
            return false;
        }

        if (!dosagesAreCompatible(first, second)) {
            return false;
        }

        List<String> smaller = firstWords.size() <= secondWords.size() ? firstWords : secondWords;
        List<String> larger = smaller == firstWords ? secondWords : firstWords;

        return smaller.stream().allMatch(word -> containsSimilarWord(larger, word));
    }

    public static String longestSignificantWord(String name) {
        return significantWords(name).stream()
                .max((first, second) -> Integer.compare(first.length(), second.length()))
                .orElse("");
    }

    private static boolean containsSimilarWord(List<String> words, String target) {
        return words.stream().anyMatch(word -> TextSimilarity.isSimilar(word, target, WORD_SIMILARITY_THRESHOLD));
    }

    private static boolean dosagesAreCompatible(String first, String second) {
        Set<String> firstDosages = dosageNumbers(first);
        Set<String> secondDosages = dosageNumbers(second);

        if (firstDosages.isEmpty() || secondDosages.isEmpty()) {
            return true;
        }

        return firstDosages.stream().anyMatch(secondDosages::contains);
    }

    private static Set<String> dosageNumbers(String name) {
        Matcher matcher = DIGITS.matcher(TextSimilarity.normalize(name));
        Set<String> numbers = new HashSet<>();

        while (matcher.find()) {
            numbers.add(matcher.group());
        }

        return numbers;
    }

    private static List<String> significantWords(String name) {
        String normalized = TextSimilarity.normalize(name);

        if (normalized.isEmpty()) {
            return List.of();
        }

        return Arrays.stream(normalized.split(" "))
                .filter(word -> !IGNORED_WORDS.contains(word))
                .filter(word -> !containsDigit(word))
                .toList();
    }

    private static boolean containsDigit(String word) {
        return word.chars().anyMatch(Character::isDigit);
    }
}
