package com.devluanpaiva.controle_de_remedios.shared.utils;

import java.text.Normalizer;

public final class SlugGenerator {
    private SlugGenerator() {
    }

    public static String generate(String input) {
        String withoutAccents = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");

        return withoutAccents
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
    }
}
