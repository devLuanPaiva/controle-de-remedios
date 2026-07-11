package com.devluanpaiva.controle_de_remedios.modules.storage.service.impl;

import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.storage.dto.PresignedUploadResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.storage.service.StorageService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
public class StorageServiceImpl implements StorageService {
    private static final Duration UPLOAD_URL_TTL = Duration.ofMinutes(10);
    private static final String OBJECT_PREFIX = "prescriptions/";

    private final S3Presigner s3Presigner;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;
    private final String bucket;
    private final String region;
    private final String publicBaseUrl;

    public StorageServiceImpl(
            S3Presigner s3Presigner,
            SecurityContextHelper securityContextHelper,
            AuthorizationPolicy authorizationPolicy,
            @Value("${aws.s3.bucket}") String bucket,
            @Value("${aws.region}") String region,
            @Value("${aws.s3.public-base-url:}") String publicBaseUrl) {

        this.s3Presigner = s3Presigner;
        this.securityContextHelper = securityContextHelper;
        this.authorizationPolicy = authorizationPolicy;
        this.bucket = bucket;
        this.region = region;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Override
    public PresignedUploadResponseDTO createPresignedUpload(PresignedUploadRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        authorizationPolicy.requireAdminOrRoleWithCondition(actor, UserRole.MANAGER, () -> true);

        if (!dto.contentType().startsWith("image/")) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de arquivo inválido",
                    "INVALID_CONTENT_TYPE",
                    "contentType",
                    "Apenas arquivos de imagem são permitidos.");
        }

        String objectKey = OBJECT_PREFIX + UUID.randomUUID() + extensionOf(dto.fileName());

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(dto.contentType())
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(UPLOAD_URL_TTL)
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return new PresignedUploadResponseDTO(
                presignedRequest.url().toString(),
                buildPublicUrl(objectKey),
                objectKey);
    }

    private String buildPublicUrl(String objectKey) {
        if (StringUtils.hasText(publicBaseUrl)) {
            return publicBaseUrl.replaceAll("/+$", "") + "/" + objectKey;
        }

        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + objectKey;
    }

    private String extensionOf(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 ? fileName.substring(dotIndex) : "";
    }
}
