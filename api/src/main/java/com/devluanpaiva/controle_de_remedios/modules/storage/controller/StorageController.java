package com.devluanpaiva.controle_de_remedios.modules.storage.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.storage.service.StorageService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class StorageController {
    private final StorageService storageService;

    @PostMapping("/presigned-url")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PresignedUploadResponseDTO> createPresignedUpload(
            @RequestBody @Valid PresignedUploadRequestDTO dto) {

        return ApiResponseFactory.success(
                "URL de upload gerada com sucesso", storageService.createPresignedUpload(dto));
    }
}
