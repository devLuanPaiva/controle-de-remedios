package com.devluanpaiva.controle_de_remedios.shared.responses;

public record ApiResponse<T>(

        Boolean success,

        String message,

        Long count,

        Integer currentPage,

        Integer totalPages,

        String next,

        String previous,

        T data) {
}