package com.devluanpaiva.controle_de_remedios.modules.storage.service;

import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadResponseDTO;

public interface StorageService {
    PresignedUploadResponseDTO createPresignedUpload(PresignedUploadRequestDTO dto);
}
