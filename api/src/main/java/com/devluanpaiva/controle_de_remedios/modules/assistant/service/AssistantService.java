package com.devluanpaiva.controle_de_remedios.modules.assistant.service;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;

public interface AssistantService {
    ChatResponseDTO chat(ChatRequestDTO dto);
}
