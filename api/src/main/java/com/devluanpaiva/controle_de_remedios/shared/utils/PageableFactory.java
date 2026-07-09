package com.devluanpaiva.controle_de_remedios.shared.utils;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

public final class PageableFactory {
    private static final int MAX_PAGE_SIZE = 100;

    private PageableFactory() {
    }

    public static Pageable build(int page, int size) {
        if (page < 0) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Parâmetro de paginação inválido",
                    "INVALID_PAGINATION",
                    "page",
                    "O parâmetro 'page' não pode ser negativo.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Parâmetro de paginação inválido",
                    "INVALID_PAGINATION",
                    "size",
                    "O parâmetro 'size' deve estar entre 1 e " + MAX_PAGE_SIZE + ".");
        }

        return PageRequest.of(page, size);
    }
}
