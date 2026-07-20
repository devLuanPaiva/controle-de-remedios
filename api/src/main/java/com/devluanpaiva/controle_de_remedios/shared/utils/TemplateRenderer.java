package com.devluanpaiva.controle_de_remedios.shared.utils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

public final class TemplateRenderer {

    private TemplateRenderer() {
    }

    public static String render(String classpathLocation, Map<String, String> variables) {
        String template = readTemplate(classpathLocation);

        for (Map.Entry<String, String> variable : variables.entrySet()) {
            template = template.replace("{{" + variable.getKey() + "}}", variable.getValue());
        }

        return template;
    }

    private static String readTemplate(String classpathLocation) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathLocation);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException(
                    "Não foi possível carregar o template de e-mail '" + classpathLocation + "'", ex);
        }
    }
}
