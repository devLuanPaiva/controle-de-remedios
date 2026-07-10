package com.devluanpaiva.controle_de_remedios.modules.patient.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientWithAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.UpdatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientFilter;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientService;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PatientResponseDTO> createPatient(@RequestBody @Valid CreatePatientRequestDTO dto) {
        return ApiResponseFactory.success("Paciente criado com sucesso", patientService.createPatient(dto));
    }

    @GetMapping
    public ApiResponse<List<PatientResponseDTO>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cpf) {

        Pageable pageable = PageableFactory.build(page, size);
        PatientFilter filter = new PatientFilter(companyId, name, cpf);
        Page<PatientResponseDTO> result = patientService.getPatients(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de pacientes obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/{id}")
    public ApiResponse<PatientResponseDTO> getPatientById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Paciente encontrado com sucesso", patientService.getPatientById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<PatientResponseDTO> updatePatient(@PathVariable UUID id,
            @RequestBody @Valid UpdatePatientRequestDTO dto) {
        return ApiResponseFactory.success("Paciente atualizado com sucesso", patientService.updatePatient(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return ApiResponseFactory.success("Paciente deletado com sucesso", null);
    }

    @PostMapping("/{id}/account")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponseDTO> createPatientAccount(@PathVariable UUID id,
            @RequestBody @Valid CreatePatientAccountRequestDTO dto) {
        return ApiResponseFactory.success(
                "Conta vinculada ao paciente com sucesso", patientService.createPatientAccount(id, dto));
    }

    @PostMapping("/with-account")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PatientResponseDTO> createPatientWithAccount(
            @RequestBody @Valid CreatePatientWithAccountRequestDTO dto) {
        return ApiResponseFactory.success(
                "Paciente e conta criados com sucesso", patientService.createPatientWithAccount(dto));
    }

    @DeleteMapping("/{id}/account")
    public ApiResponse<Void> removePatientAccount(@PathVariable UUID id) {
        patientService.removePatientAccount(id);
        return ApiResponseFactory.success("Conta desvinculada do paciente com sucesso", null);
    }
}
