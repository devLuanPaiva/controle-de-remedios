package com.devluanpaiva.controle_de_remedios.modules.company.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.company.dto.AssociateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CreateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.UpdateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanyFilter;
import com.devluanpaiva.controle_de_remedios.modules.company.service.CompanyService;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CompanyResponseDTO> createCompany(@RequestBody @Valid CreateCompanyRequestDTO dto) {
        return ApiResponseFactory.success("Empresa criada com sucesso", companyService.createCompany(dto));
    }

    @GetMapping
    public ApiResponse<List<CompanyResponseDTO>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String cnpj) {

        Pageable pageable = PageableFactory.build(page, size);
        CompanyFilter filter = new CompanyFilter(name, slug, cnpj);
        Page<CompanyResponseDTO> result = companyService.getCompanies(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de empresas obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/{id}")
    public ApiResponse<CompanyResponseDTO> getCompanyById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Empresa encontrada com sucesso", companyService.getCompanyById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<CompanyResponseDTO> updateCompany(@PathVariable UUID id,
            @RequestBody @Valid UpdateCompanyRequestDTO dto) {
        return ApiResponseFactory.success("Empresa atualizada com sucesso", companyService.updateCompany(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ApiResponseFactory.success("Empresa deletada com sucesso", null);
    }

    @GetMapping("/{id}/users")
    public ApiResponse<List<UserResponseDTO>> getCompanyUsers(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size);

        Page<UserResponseDTO> result = companyService.getCompanyUsers(id, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated("Usuários da empresa obtidos com sucesso", result, next, previous);
    }

    @PostMapping("/{id}/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> associateUser(@PathVariable UUID id, @RequestBody @Valid AssociateUserRequestDTO dto) {
        companyService.associateUser(id, dto.userId());
        return ApiResponseFactory.success("Usuário associado à empresa com sucesso", null);
    }

    @DeleteMapping("/{id}/users/{userId}")
    public ApiResponse<Void> removeUser(@PathVariable UUID id, @PathVariable UUID userId) {
        companyService.removeUser(id, userId);
        return ApiResponseFactory.success("Usuário removido da empresa com sucesso", null);
    }
}
