package com.devluanpaiva.controle_de_remedios.modules.assistant.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.AssistantService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
public class AssistantController {
    private final AssistantService assistantService;

    @PostMapping("/chat")
    public ApiResponse<ChatResponseDTO> chat(@RequestBody @Valid ChatRequestDTO dto) {
        return ApiResponseFactory.success("Resposta do assistente obtida com sucesso", assistantService.chat(dto));
    }
}
