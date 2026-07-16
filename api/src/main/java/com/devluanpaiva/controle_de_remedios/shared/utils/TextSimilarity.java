package com.devluanpaiva.controle_de_remedios.shared.utils;

import java.text.Normalizer;

public final class TextSimilarity {
    private TextSimilarity() {
    }

    public static boolean isSimilar(String first, String second, double threshold) {
        String normalizedFirst = normalize(first);
        String normalizedSecond = normalize(second);

        if (normalizedFirst.isEmpty() || normalizedSecond.isEmpty()) {
            return false;
        }

        return ratio(normalizedFirst, normalizedSecond) >= threshold;
    }

    private static double ratio(String first, String second) {
        int maxLength = Math.max(first.length(), second.length());
        if (maxLength == 0) {
            return 1.0;
        }

        return 1.0 - ((double) levenshteinDistance(first, second) / maxLength);
    }

    private static int levenshteinDistance(String first, String second) {
        int[][] distances = new int[first.length() + 1][second.length() + 1];

        for (int i = 0; i <= first.length(); i++) {
            distances[i][0] = i;
        }

        for (int j = 0; j <= second.length(); j++) {
            distances[0][j] = j;
        }

        for (int i = 1; i <= first.length(); i++) {
            for (int j = 1; j <= second.length(); j++) {
                int substitutionCost = first.charAt(i - 1) == second.charAt(j - 1) ? 0 : 1;

                distances[i][j] = Math.min(
                        Math.min(distances[i - 1][j] + 1, distances[i][j - 1] + 1),
                        distances[i - 1][j - 1] + substitutionCost);
            }
        }

        return distances[first.length()][second.length()];
    }

    public static String normalize(String value) {
        if (value == null) {
            return "";
        }

        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");

        return withoutAccents
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
