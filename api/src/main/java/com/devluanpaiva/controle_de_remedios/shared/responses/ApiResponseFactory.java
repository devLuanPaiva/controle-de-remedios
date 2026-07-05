package com.devluanpaiva.controle_de_remedios.shared.responses;

import java.util.List;

import org.springframework.data.domain.Page;

public final class ApiResponseFactory {
    private ApiResponseFactory() {
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                true, message, null, null, null, null, null, data);
    }

    public static <T> ApiResponse<List<T>> list(String message, List<T> data) {
        return new ApiResponse<>(
                true,
                message,
                (long) data.size(),
                1,
                1,
                null,
                null,
                data);
    }

    public static <T> ApiResponse<List<T>> paginated(
            String message,
            Page<T> page,
            String next,
            String previous) {

        return new ApiResponse<>(
                true,
                message,
                page.getTotalElements(),
                page.getNumber() + 1,
                page.getTotalPages(),
                next,
                previous,
                page.getContent());
    }
}
