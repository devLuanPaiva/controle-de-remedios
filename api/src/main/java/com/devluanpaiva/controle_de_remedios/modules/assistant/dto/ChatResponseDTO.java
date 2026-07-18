package com.devluanpaiva.controle_de_remedios.modules.assistant.dto;

import java.util.UUID;

public record ChatResponseDTO(
        UUID conversationId,
        String answer) {
}
