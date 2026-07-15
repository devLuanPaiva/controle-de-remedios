package com.devluanpaiva.controle_de_remedios.modules.storage.service.impl;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Duration;
import java.util.Set;

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

    private static final String PROFILES_PREFIX = "profiles/";
    private static final String PRESCRIPTIONS_PREFIX = "prescriptions/";
    private static final String MEDICINES_PREFIX = "medicines/";

    private static final String RANDOM_KEY_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int RANDOM_KEY_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

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
        authorizationPolicy.requireAdminOrRolesWithCondition(actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> true);

        if (!dto.contentType().startsWith("image/")) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de arquivo inválido",
                    "INVALID_CONTENT_TYPE",
                    "contentType",
                    "Apenas arquivos de imagem são permitidos.");
        }

        String objectKey = buildObjectKey(dto);

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

    private String buildObjectKey(PresignedUploadRequestDTO dto) {
        String extension = extensionOf(dto.fileName());
        String randomKey = randomKey();

        return switch (dto.context()) {
            case PROFILE -> PROFILES_PREFIX + slugify(requireOwnerName(dto)) + "-" + randomKey + extension;
            case PRESCRIPTION -> PRESCRIPTIONS_PREFIX + "prescription-" + randomKey + extension;
            case MEDICINE -> MEDICINES_PREFIX + slugify(requireOwnerName(dto)) + "-" + randomKey + extension;
        };
    }

    private String requireOwnerName(PresignedUploadRequestDTO dto) {
        if (!StringUtils.hasText(dto.ownerName())) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Nome do usuário é obrigatório",
                    "OWNER_NAME_REQUIRED",
                    "ownerName",
                    "Informe o nome do usuário para nomear a imagem de perfil.");
        }

        return dto.ownerName();
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

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String collapsed = normalized.toLowerCase().replaceAll("[^a-z0-9]+", "-");

        int start = 0;
        int end = collapsed.length();
        while (start < end && collapsed.charAt(start) == '-') {
            start++;
        }
        while (end > start && collapsed.charAt(end - 1) == '-') {
            end--;
        }

        String slug = collapsed.substring(start, end);

        return StringUtils.hasText(slug) ? slug : "usuario";
    }

    private String randomKey() {
        StringBuilder key = new StringBuilder(RANDOM_KEY_LENGTH);

        for (int i = 0; i < RANDOM_KEY_LENGTH; i++) {
            key.append(RANDOM_KEY_ALPHABET.charAt(RANDOM.nextInt(RANDOM_KEY_ALPHABET.length())));
        }

        return key.toString();
    }
}
